package postgres

import (
	"fmt"
	"strings"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type PGConfig struct {
	Host            string
	Port            int
	DBName          string
	DefaultDBName   string
	User            string
	Pass            string
	SSLMode         string
	MaxIdleConns    int
	MaxOpenConns    int
	ConnMaxLifeTime int
	Charset         string
	Extras          string
	TimeZone        string
}

func InitDB(config *PGConfig) (*gorm.DB, error) {
	dsn := buildDSN(config, false)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		// try to create database
		dsn = buildDSN(config, true)
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err != nil {
			return nil, err
		}

		sqlDB, err := db.DB()
		if err != nil {
			return nil, err
		}
		defer sqlDB.Close()

		// check if the db exists
		rows, err := sqlDB.Query(fmt.Sprintf("SELECT 1 FROM pg_database where datname = '%s'", config.DBName))
		if err != nil {
			return nil, err
		}

		if !rows.Next() {
			// create database
			_, err = sqlDB.Exec(fmt.Sprintf("CREATE DATABASE %s", config.DBName))
			if err != nil {
				return nil, err
			}
		}
		// connect the db
		dsn = buildDSN(config, false)
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err != nil {
			return nil, err
		}
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	// check uuid-ossp extension exists
	rows, err := sqlDB.Query("SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp'")
	if err != nil {
		return nil, err
	}

	if !rows.Next() {
		// create the uuid-ossp extension
		_, err = sqlDB.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"")
		if err != nil {
			return nil, err
		}
	}

	// configure pool
	sqlDB.SetMaxIdleConns(config.MaxIdleConns)
	sqlDB.SetMaxOpenConns(config.MaxOpenConns)
	sqlDB.SetConnMaxLifetime(time.Duration(config.ConnMaxLifeTime) * time.Second)

	return db, nil
}

func buildDSN(config *PGConfig, useDefaultDB bool) string {
	dsn := fmt.Sprintf("host=%s port=%d user=%s dbname=%s sslmode=%s TimeZone=%s",
		config.Host,
		config.Port,
		config.User,
		func() string {
			if useDefaultDB {
				return config.DefaultDBName
			}
			return config.DBName
		}(),
		config.SSLMode,
		config.TimeZone,
	)
	if config.Pass != "" {
		dsn = fmt.Sprintf("%s password=%s", dsn, config.Pass)
	}
	if config.Charset != "" {
		dsn = fmt.Sprintf("%s client_encoding=%s", dsn, config.Charset)
	}
	if config.Extras != "" {
		extra := strings.ReplaceAll(config.Extras, "options=", "")
		dsn = fmt.Sprintf("%s options=%s", dsn, extra)
	}
	return dsn
}
