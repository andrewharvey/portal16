'use strict';

let Registry = require('./registry'),
    utils = rootRequire('app/helpers/utils');

async function getNode(key) {
    if (!utils.isGuid(key)) {
        throw {
            statusCode: 404,
            message: 'not a valid node key'
        };
    }
    let registryNode = await Registry.get(key);
    return registryNode;

    // let firstDirectoryIdentifier = _.find(registryNode.identifiers, {type: 'GBIF_PARTICIPANT'});
    // if (firstDirectoryIdentifier) {
    //    return Participant.get(firstDirectoryIdentifier.identifier, locale);
    // } else {
    //    throw {
    //        statusCode: 404,
    //        message: 'node could not  be found in the directory as a participants. All nodes are assumed to be participants as well'
    //    }
    // }
}

module.exports = {
    get: getNode
};
