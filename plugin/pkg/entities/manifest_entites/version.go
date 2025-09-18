package manifest_entites

type Version string

func (v Version) String() string {
	return string(v)
}
