package db

import (
	"fmt"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// GenericQuery is a function for GORM queries
type GenericQuery func(db *gorm.DB) *gorm.DB

type GenericComparableConstraint interface {
	int | int8 | int16 | int32 | int64 | uint | uint8 | uint16 | uint32 | uint64 | bool
}

type GenericEqualableConstraint interface {
	GenericComparableConstraint | string
}

func WithTransaction(fn func(db *gorm.DB) error, ctx ...*gorm.DB) error {
	// Start transaction
	db := DB
	if len(ctx) > 0 {
		db = ctx[0]
	}

	tx := db.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	err := fn(db)
	if err != nil {
		if err := tx.Rollback().Error; err != nil {
			return fmt.Errorf("failed rollback tx: %v", err)
		}
		return err
	}
	tx.Commit()
	return nil
}

func WithTransactionContext(tx *gorm.DB) GenericQuery {
	return func(_ *gorm.DB) *gorm.DB {
		return tx
	}
}

func GetOne[T any](query ...GenericQuery) (T, error) {
	var data T
	db := DB
	for _, q := range query {
		db = q(db)
	}
	err := db.First(&data).Error
	return data, err
}

func GetAll[T any](query ...GenericQuery) ([]T, error) {
	var data []T
	db := DB
	for _, q := range query {
		db = q(db)
	}
	err := db.Find(&data).Error
	return data, err
}

func GetCount[T any](query ...GenericQuery) (int64, error) {
	var model T
	var count int64
	db := DB
	for _, q := range query {
		db = q(db)
	}
	err := db.Model(&model).Count(&count).Error
	return count, err
}

func Run(query ...GenericQuery) error {
	db := DB
	for _, q := range query {
		db = q(db)
	}
	// execute query
	return db.Error
}

// Inc increments columns by the provided value
func Inc[T GenericComparableConstraint](updates map[string]T) GenericQuery {
	return func(db *gorm.DB) *gorm.DB {
		// Pre-allocate map capacity
		m := make(map[string]any, len(updates))
		for field, value := range updates {
			m[field] = gorm.Expr(fmt.Sprintf("%s + ?", field), value)
		}
		return db.UpdateColumns(m)
	}
}

// Dec decrements columns by the provided value
func Dec[T GenericComparableConstraint](updates map[string]T) GenericQuery {
	return func(db *gorm.DB) *gorm.DB {
		// Pre-allocate map capacity
		m := make(map[string]any, len(updates))
		for field, value := range updates {
			m[field] = gorm.Expr(fmt.Sprintf("%s - ?", field), value)
		}
		return db.UpdateColumns(m)
	}
}

// Model sets the model for the query
func Model(model any) GenericQuery {
	return func(db *gorm.DB) *gorm.DB {
		return db.Model(model)
	}
}

// InArray adds a WHERE IN condition to the query
func InArray(field string, value []interface{}) GenericQuery {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where(fmt.Sprintf("%s IN ?", field), value)
	}
}

func DropTable(model any) error {
	return DB.Migrator().DropTable(model)
}

func CreateDatabase(name string) error {
	return DB.Exec(fmt.Sprintf("CREATE DATABASE %s", name)).Error
}

func CreateTable(model any) error {
	return DB.Migrator().CreateTable(model)
}

func Create(data any, ctx ...*gorm.DB) error {
	if len(ctx) > 0 {
		return ctx[0].Create(data).Error
	}
	return DB.Create(data).Error
}

func Update(data any, ctx ...*gorm.DB) error {
	if len(ctx) > 0 {
		return ctx[0].Save(data).Error
	}
	return DB.Save(data).Error
}

func Delete(data any, ctx ...*gorm.DB) error {
	if len(ctx) > 0 {
		return ctx[0].Delete(data).Error
	}
	return DB.Delete(data).Error
}

func DeleteBy[T any](query T, ctx ...*gorm.DB) error {
	var model T
	if len(ctx) > 0 {
		return ctx[0].Where(query).Delete(&model).Error
	}
	return DB.Where(query).Delete(&model).Error
}

func ReplaceAssociation[T any, U any](source *T, field string, associations []U, ctx ...*gorm.DB) error {
	if len(ctx) > 0 {
		return ctx[0].Model(source).Association(field).Replace(associations)
	}
	return DB.Model(source).Association(field).Replace(associations)
}

func AppendAssociation[T any, U any](source *T, field string, associations []U, ctx ...*gorm.DB) error {
	if len(ctx) > 0 {
		return ctx[0].Model(source).Association(field).Append(associations)
	}
	return DB.Model(source).Association(field).Append(associations)
}

func ClearAssociation[T any](source *T, field string, ctx ...*gorm.DB) error {
	if len(ctx) > 0 {
		return ctx[0].Model(source).Association(field).Clear()
	}
	return DB.Model(source).Association(field).Clear()
}

func Equal[T GenericEqualableConstraint](field string, value T) GenericQuery {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where(fmt.Sprintf("%s = ?", field), value)
	}
}

func NotEqual[T GenericEqualableConstraint](field string, value T) GenericQuery {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where(fmt.Sprintf("%s <> ?", field), value)
	}
}

func GreaterThan[T GenericComparableConstraint](field string, value T) GenericQuery {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where(fmt.Sprintf("%s > ?", field), value)
	}
}

func GreaterThanOrEqual[T GenericComparableConstraint](field string, value T) GenericQuery {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where(fmt.Sprintf("%s >= ?", field), value)
	}
}

func LessThan[T GenericComparableConstraint](field string, value T) GenericQuery {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where(fmt.Sprintf("%s < ?", field), value)
	}
}

func LessThanOrEqual[T GenericComparableConstraint](field string, value T) GenericQuery {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where(fmt.Sprintf("%s <= ?", field), value)
	}
}

func Like(field string, value string) GenericQuery {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where(fmt.Sprintf("%s LIKE ?", field), value)
	}
}

func OrderBy(field string, desc bool) GenericQuery {
	return func(db *gorm.DB) *gorm.DB {
		if desc {
			return db.Order(fmt.Sprintf("%s DESC", field))
		}
		return db.Order(fmt.Sprintf("%s ASC", field))
	}
}

func Limit(limit int) GenericQuery {
	return func(db *gorm.DB) *gorm.DB {
		return db.Limit(limit)
	}
}

func Offset(offset int) GenericQuery {
	return func(db *gorm.DB) *gorm.DB {
		return db.Offset(offset)
	}
}

func Page(page int, pageSize int) GenericQuery {
	return func(db *gorm.DB) *gorm.DB {
		if page < 1 {
			page = 1
		}
		if pageSize <= 0 {
			pageSize = 10
		}
		offset := (page - 1) * pageSize
		return db.Offset(offset).Limit(pageSize)
	}
}

// WLock applies a write lock to the selected rows
func WLock() GenericQuery {
	return func(tx *gorm.DB) *gorm.DB {
		return tx.Clauses(clause.Locking{Strength: "UPDATE"})
	}
}
