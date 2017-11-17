class Updater {
  constructor(itemsense, currentConfigs) {
    this.itemsense = itemsense;
    this.currentConfigs = currentConfigs;
    this.newConfig = {};
    this.confCategory = '';
    this.existingId = null;
    this.existingName = null;
  }

  idIsConfigKey() {
    return (
      (this.confCategory === 'thresholds')
      || (this.confCategory === 'antennaConfigurations')
    );
  }

  checkAlreadyExistsAndFetch(key) {
    if (!this.currentConfigs[this.confCategory].length) {
      return { exists: false, result: undefined };
    }
    const result = this.currentConfigs[this.confCategory].find(
      currentConfig => currentConfig[key] === this.newConfig[key]
    );
    if (result) return { exists: true, result };
    return { exists: false, result }; // returns undefined if no match
  }

  idInIS() {
    if (this.existingId) return this.existingId;
    this.existingId = this.checkAlreadyExistsAndFetch('id');
    return this.existingId;
  }

  nameInIS() {
    if (this.existingName) return this.existingName;
    this.existingName = this.checkAlreadyExistsAndFetch('name');
    return this.existingName;
  }

  updateArgs() {
    if (this.idIsConfigKey() && this.nameInIS().exists) {
      return [this.newConfig.id, this.newConfig];
    }
    if (this.confCategory === 'facilities') return [this.newConfig.name];
    return [this.newConfig];
  }

  updateFunction() {
    if (this.idIsConfigKey()) {
      if (this.idInIS().exists && this.nameInIS().exists) {
        return this.itemsense[this.confCategory].update(...this.updateArgs());
      } else if (this.nameInIS().exists) {
        this.newConfig.id = this.existingName.result.id;
        return this.itemsense[this.confCategory].update(...this.updateArgs());
      }
      if (this.newConfig.id) delete this.newConfig.id;
      return this.itemsense[this.confCategory].create(...this.updateArgs());
    } else if (this.nameInIS().exists) {
      return this.itemsense[this.confCategory].update(...this.updateArgs());
    }
    return this.itemsense[this.confCategory].create(...this.updateArgs());
  }

  send(newConfig, category) {
    this.newConfig = newConfig;
    this.confCategory = category;
    this.existingId = null;
    this.existingName = null;
    return this.updateFunction();
  }
}

exports.Updater = Updater;
