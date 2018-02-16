'use strict';

let resource = require('../resource'),
    keys = rootRequire('app/helpers/constants').keys,
    _ = require('lodash'),
    api = require('../apiConfig');

let Taxon = function(record) {
    this.record = record;
};

Taxon.prototype.record = {};

/**
 *
 * @param key
 * @param options with expand and expandBackboneOnly settings
 * @return {*}
 */
Taxon.get = function(key, options) {
    options = options || {};
    let promise = resource.get(api.taxon.url + key).as(Taxon);
    if (typeof options.expand === 'undefined') {
        return promise;
    } else {
        return promise.then(function(taxon) {
            // check expandBackboneOnly option
            if (!typeof options.expandBackboneOnly === 'undefined') {// TODO this doesn't look meaningful. ! binds to the part before the comparison
                options.expand = [];
            } else if (taxon.record.origin != 'SOURCE') {
                // the verbatim resource only exists for origin=SOURCE
                _.pull(options.expand, 'verbatim');
            }
            return taxon.expand(options.expand);
        });
    }
};

Taxon.prototype.isNub = function() {
    return this.record.datasetKey == keys.nubKey;
};

Taxon.prototype.expand = function(fieldNames) {
    let resources = [],
        resourceLookup = {
            name: {
                resource: api.taxon.url + this.record.key + '/name',
                extendToField: 'name'
            },
            dataset: {
                resource: api.dataset.url + this.record.datasetKey,
                extendToField: 'dataset'
            },
            descriptions: {
                resource: api.taxon.url + this.record.key + '/descriptions',
                extendToField: 'descriptions'
            },
            parents: {
                resource: api.taxon.url + this.record.key + '/parents',
                extendToField: 'parents'
            },
            synonyms: {
                resource: api.taxon.url + this.record.key + '/synonyms',
                extendToField: 'synonyms'
            },
            combinations: {
                resource: api.taxon.url + this.record.key + '/combinations',
                extendToField: 'combinations'
            },
            media: {
                resource: api.taxon.url + this.record.key + '/media?limit=50',
                extendToField: 'media'
            },
            occurrenceCount: {
                resource: api.occurrence.url + 'count?taxonKey=' + this.record.key,
                extendToField: 'occurrenceCount'
            },
            occurrenceGeoRefCount: {
                resource: api.occurrence.url + 'count?isGeoreferenced=true&taxonKey=' + this.record.key,
                extendToField: 'occurrenceGeoRefCount'
            },
            occurrenceImages: {
                resource: api.occurrenceSearch.url + '?limit=35&media_type=stillImage&taxonKey=' + this.record.key,
                extendToField: 'occurrenceImages'
            },
            references: {
                resource: api.taxon.url + this.record.key + '/references',
                extendToField: 'references'
            },
            related: {
                resource: api.taxon.url + this.record.key + '/related?limit=50',
                extendToField: 'related'
            },
            homonyms: {
                resource: api.taxon.url + '?datasetKey=' + this.record.datasetKey + '&name=' + this.record.canonicalName,
                extendToField: 'homonyms'
            },
            info: {
                resource: api.taxon.url + this.record.key + '/speciesProfiles?limit=50',
                extendToField: 'info'
            },
            typification: {
                resource: api.taxon.url + this.record.key + '/typeSpecimens',
                extendToField: 'typification'
            },
            verbatim: {
                resource: api.taxon.url + this.record.key + '/verbatim',
                extendToField: 'verbatim'
            },
            vernacular: {
                resource: api.taxon.url + this.record.key + '/vernacularNames?limit=50',
                extendToField: 'vernacular'
            }
        };
    // add optional resources
    if (this.record.constituentKey) {
        resourceLookup.constituent = {
            resource: api.dataset.url + this.record.constituentKey,
            extendToField: 'constituent'
        };
    }
    fieldNames.forEach(function(e) {
        if (resourceLookup.hasOwnProperty(e)) resources.push(resourceLookup[e]);
    });
    return resource.extend(this).with(resources);
};

module.exports = Taxon;
