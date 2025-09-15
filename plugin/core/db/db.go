package db

import (
	"log"

	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/core/db/postgres"
	"github.com/jjgagacy/workflow-app/plugin/model"
	"gorm.io/gorm"
)

var DB *gorm.DB

func migrate() error {
	err := DB.AutoMigrate(
		model.Plugin{},
	)
	if err != nil {
		return err
	}

	return nil
}

func Init(config *core.Config) {
	var err error
	if config.DBType == "postgresql" {
		DB, err = postgres.InitDB(&postgres.PGConfig{
			Host:            config.DBHost,
			Port:            int(config.DBPort),
			DBName:          config.DBDatabase,
			DefaultDBName:   config.DBDefaultDatabase,
			User:            config.DBUsername,
			Pass:            *config.DBPassword,
			SSLMode:         config.DBSslMode,
			MaxIdleConns:    config.DBMaxIdleConns,
			MaxOpenConns:    config.DBMaxOpenConns,
			ConnMaxLifeTime: config.DBConnMaxLifetime,
			Charset:         config.DBCharset,
			Extras:          config.DBExtras,
		})
	} else {
		log.Fatalf("unsupported database type: %v", config.DBType)
	}

	if err != nil {
		log.Fatalf("failed to init plugin db: %v", err)
	}

	err = migrate()
	if err != nil {
		log.Fatalf("failed to migrate: %v", err)
	}
}

func Close() {
	db, err := DB.DB()
	if err != nil {
		log.Fatalf("failed to get db: %v", err)
		return
	}

	err = db.Close()
	if err != nil {
		log.Fatalf("failed to close db: %v", err)
		return
	}
}
