package plugin_packager

import (
	"errors"
	"fmt"
)

func (p *Packager) Validate() error {
	// read manifest
	_, err := p.fetchManifest()
	if err != nil {
		return err
	}

	err = p.decoder.CheckAssetValid()
	if err != nil {
		return errors.Join(err, fmt.Errorf("assets invalid"))
	}

	return nil
}
