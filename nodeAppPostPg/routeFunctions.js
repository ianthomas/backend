"use strict";
// route names, handlers and support functions
Object.defineProperty(exports, "__esModule", { value: true });
// const moment          = require('moment');
// const postgresQueries = require('./postgresQueries.js');
var postgresQueries_1 = require("./postgresQueries");
var PostFunctions_1 = require("./PostFunctions");
var postgresQueries = new postgresQueries_1.PostgresQueries();
var postFunctions = new PostFunctions_1.PostFunctions();
var dbQueries = require('./dbQueries.js');
var UNMATCHED_DRIVERS_ROUTE = 'unmatched-drivers';
var UNMATCHED_RIDERS_ROUTE = 'unmatched-riders';
var DRIVER_ROUTE = 'driver';
var RIDER_ROUTE = 'rider';
var HELPER_ROUTE = 'helper';
var CANCEL_RIDE_REQUEST_ROUTE = 'cancel-ride-request';
var CANCEL_RIDER_MATCH_ROUTE = 'cancel-rider-match';
var CANCEL_DRIVE_OFFER_ROUTE = 'cancel-drive-offer';
var CANCEL_DRIVER_MATCH_ROUTE = 'cancel-driver-match';
var ACCEPT_DRIVER_MATCH_ROUTE = 'accept-driver-match';
var PAUSE_DRIVER_MATCH_ROUTE = 'pause-driver-match';
var DRIVER_EXISTS_ROUTE = 'driver-exists';
var DRIVER_INFO_ROUTE = 'driver-info';
var DRIVER_PROPOSED_MATCHES_ROUTE = 'driver-proposed-matches';
var DRIVER_CONFIRMED_MATCHES_ROUTE = 'driver-confirmed-matches';
var RIDER_EXISTS_ROUTE = 'rider-exists';
var RIDER_INFO_ROUTE = 'rider-info';
var RIDER_CONFIRMED_MATCH_ROUTE = 'rider-confirmed-match';
var DELETE_DRIVER_ROUTE = 'driver';
var PUT_RIDER_ROUTE = 'rider';
var PUT_DRIVER_ROUTE = 'driver';
var rfPool = undefined;
// NOTE: module.exports at bottom of file
function setPool(pool) {
    rfPool = pool;
    postFunctions.setPool(pool);
}
function getAnon(req, reply) {
    var results = {
        success: 'GET carpool: ',
        failure: 'GET error: '
    };
    req.log();
    postgresQueries.dbGetData(rfPool, dbQueries.dbGetQueryString, reply, results);
}
var getClientAddress = function (req) {
    // See http://stackoverflow.com/questions/10849687/express-js-how-to-get-remote-client-address
    // and http://stackoverflow.com/questions/19266329/node-js-get-clients-ip/19267284
    return (req.headers['x-forwarded-for'] || '').split(',')[0]
        || req.connection.remoteAddress;
};
function logPostDriver(req) {
    var payload = req.payload;
    console.log("driver radius1 : " + payload.DriverCollectionRadius);
    sanitiseDriver(payload);
    console.log("driver radius2 : " + payload.DriverCollectionRadius);
    console.log("driver payload: " + JSON.stringify(payload, null, 4));
    console.log("driver zip: " + payload.DriverCollectionZIP);
    req.log();
}
var postDriver = postFunctions.createPostFn(DRIVER_ROUTE, dbQueries.dbGetSubmitDriverString, getDriverPayloadAsArray, logPostDriver);
// function logPost (req: any) {
//   req.log();
// }
// function createPostFn 
//   (resultStringText: string, 
//     dbQueryFn: any, payloadFn: any, logFn: any) {
//   function postFn (req: any, reply: any) {
//     var payload = req.payload;
//     var results = getExecResultStrings(resultStringText);
//     if (logFn !== undefined) {
//       logFn(req);
//     } 
//     else {
//       logPost(req);
//     }
//     // postgresQueries.dbExecuteCarpoolAPIFunction(payload, rfPool, dbQueryFn, payloadFn, req, reply, results);
//     postgresQueries.dbExecuteCarpoolAPIFunction_Insert(payload, rfPool, dbQueryFn, payloadFn, req, reply, results);
//   }
//   return postFn; 
// }
function logPostRider(req) {
    var payload = req.payload;
    //console.log("rider state1 : " + payload.RiderVotingState);
    sanitiseRider(payload);
    //console.log("rider state2 : " + payload.RiderVotingState);
    req.log();
    console.log("rider payload: " + JSON.stringify(payload, null, 4));
    console.log("rider zip: " + payload.RiderCollectionZIP);
}
var postRider = postFunctions.createPostFn(RIDER_ROUTE, dbQueries.dbGetSubmitRiderString, getRiderPayloadAsArray, logPostRider);
function logPostHelper(req) {
    var payload = req.payload;
    req.log();
    console.log("helper payload: " + JSON.stringify(payload, null, 4));
}
var postHelper = postFunctions.createPostFn(HELPER_ROUTE, dbQueries.dbGetSubmitHelperString, getHelperPayloadAsArray, logPostHelper);
function getUnmatchedDrivers(req, reply) {
    var results = {
        success: 'GET unmatched drivers: ',
        failure: 'GET unmatched drivers error: '
    };
    req.log();
    postgresQueries.dbGetUnmatchedDrivers(rfPool, dbQueries.dbGetUnmatchedDriversQueryString, reply, results);
}
function getUnmatchedRiders(req, reply) {
    var results = {
        success: 'GET unmatched riders: ',
        failure: 'GET unmatched riders error: '
    };
    req.log();
    postgresQueries.dbGetUnmatchedRiders(rfPool, dbQueries.dbGetUnmatchedRidersQueryString, reply, results);
}
var cancelRideRequest = createConfirmCancelFn('cancel ride request: ', "get payload: ", dbQueries.dbCancelRideRequestFunctionString, getTwoRiderCancelConfirmPayloadAsArray
// getCancelConfirmQueryAsArray
);
var cancelRiderMatch = createConfirmCancelFn('cancel rider match: ', "get payload: ", dbQueries.dbCancelRiderMatchFunctionString, getFourRiderCancelConfirmPayloadAsArray);
var cancelDriveOffer = createConfirmCancelFn('cancel drive offer: ', "get payload: ", dbQueries.dbCancelDriveOfferFunctionString, getTwoDriverCancelConfirmPayloadAsArray);
var cancelDriverMatch = createConfirmCancelFn('cancel driver match: ', "get payload: ", dbQueries.dbCancelDriverMatchFunctionString, 
// getThreeDriverCancelConfirmPayloadAsArray
getFourDriverCancelConfirmPayloadAsArray);
var acceptDriverMatch = createConfirmCancelFn('accept driver match: ', "get payload: ", dbQueries.dbAcceptDriverMatchFunctionString, getFourDriverCancelConfirmPayloadAsArray);
var pauseDriverMatch = createConfirmCancelFn('pause driver match: ', "get payload: ", dbQueries.dbPauseDriverMatchFunctionString, getTwoDriverCancelConfirmPayloadAsArray);
var driverExists = createConfirmCancelFn('driver exists: ', "get payload: ", dbQueries.dbDriverExistsFunctionString, getTwoDriverCancelConfirmPayloadAsArray);
var driverInfo = createConfirmCancelFn('driver info: ', "get payload: ", dbQueries.dbDriverInfoFunctionString, getTwoDriverCancelConfirmPayloadAsArray);
var driverProposedMatches = createMultipleResultsFn('driver proposed matches: ', "get payload: ", dbQueries.dbDriverProposedMatchesFunctionString, getTwoDriverCancelConfirmPayloadAsArray);
var driverConfirmedMatches = createMultipleResultsFn('driver confirmed matches: ', "get payload: ", dbQueries.dbDriverConfirmedMatchesFunctionString, getTwoDriverCancelConfirmPayloadAsArray);
var riderExists = createConfirmCancelFn('rider exists: ', "get payload: ", dbQueries.dbRiderExistsFunctionString, getTwoRiderCancelConfirmPayloadAsArray);
var riderInfo = createConfirmCancelFn('rider info: ', "get payload: ", dbQueries.dbRiderInfoFunctionString, getTwoRiderCancelConfirmPayloadAsArray);
var riderConfirmedMatch = createConfirmCancelFn('rider confirmed match: ', "get payload: ", dbQueries.dbRiderConfirmedMatchFunctionString, getTwoRiderCancelConfirmPayloadAsArray);
var cancelRideOffer = createConfirmCancelFn('cancel ride offer: ', "delete payload: ", dbQueries.dbCancelRideOfferFunctionString, getCancelRideOfferPayloadAsArray);
var rejectRide = createConfirmCancelFn('reject ride: ', "reject payload: ", dbQueries.dbRejectRideFunctionString, getRejectRidePayloadAsArray);
var confirmRide = createConfirmCancelFn('confirm ride: ', "confirm payload: ", dbQueries.dbConfirmRideFunctionString, 'getConfirmRidePayloadAsArray');
function createConfirmCancelFn(resultStringText, consoleText, dbQueryFn, payloadFn) {
    function execFn(req, reply) {
        // var payload = req.payload;
        var payload = req.query;
        var results = postFunctions.getExecResultStrings(resultStringText);
        console.log("createConfirmCancelFn-payload: ", payload);
        req.log();
        console.log(consoleText + JSON.stringify(payload, null, 4));
        postgresQueries.dbExecuteFunction(payload, rfPool, dbQueryFn, payloadFn, req, reply, results);
    }
    return execFn;
}
function createMultipleResultsFn(resultStringText, consoleText, dbQueryFn, payloadFn) {
    function execFn(req, reply) {
        // var payload = req.payload;
        var payload = req.query;
        var results = postFunctions.getExecResultStrings(resultStringText);
        console.log("createMultipleResultsFn-payload: ", payload);
        req.log();
        console.log(consoleText + JSON.stringify(payload, null, 4));
        postgresQueries.dbExecuteFunctionMultipleResults(payload, rfPool, dbQueryFn, payloadFn, req, reply, results);
    }
    return execFn;
}
// var getExecResultStrings = postFunctions.createResultStringFn(' fn called: ', ' fn call failed: '); 
function getHelperPayloadAsArray(req, payload) {
    return [
        payload.Name, payload.Email, payload.Capability
        // 1, moment().toISOString()
    ];
}
function getRiderPayloadAsArray(req, payload) {
    var ip = getClientAddress(req);
    return [
        ip,
        payload.RiderFirstName,
        payload.RiderLastName,
        payload.RiderEmail,
        payload.RiderPhone,
        payload.RiderCollectionZIP,
        payload.RiderDropOffZIP,
        payload.AvailableRideTimesJSON // this one should be in local time as passed along by the forms
        ,
        payload.TotalPartySize,
        (payload.TwoWayTripNeeded ? 'true' : 'false'),
        (payload.RiderIsVulnrable ? 'true' : 'false'),
        (payload.RiderWillNotTalkPolitics ? 'true' : 'false'),
        (payload.PleaseStayInTouch ? 'true' : 'false'),
        (payload.NeedWheelchair ? 'true' : 'false'),
        payload.RiderPreferredContact.toString(),
        payload.RiderAccommodationNotes,
        (payload.RiderLegalConsent ? 'true' : 'false'),
        (payload.RiderWillBeSafe ? 'true' : 'false'),
        payload.RiderCollectionAddress,
        payload.RiderDestinationAddress
    ];
}
function getDriverPayloadAsArray(req, payload) {
    var ip = getClientAddress(req);
    return [
        ip,
        payload.DriverCollectionZIP,
        payload.DriverCollectionRadius,
        payload.AvailableDriveTimesJSON,
        (payload.DriverCanLoadRiderWithWheelchair ? 'true' : 'false'),
        payload.SeatCount,
        payload.DriverLicenceNumber,
        payload.DriverFirstName,
        payload.DriverLastName,
        payload.DriverEmail,
        payload.DriverPhone,
        (payload.DrivingOnBehalfOfOrganization ? 'true' : 'false'),
        payload.DrivingOBOOrganizationName,
        (payload.RidersCanSeeDriverDetails ? 'true' : 'false'),
        (payload.DriverWillNotTalkPolitics ? 'true' : 'false'),
        (payload.PleaseStayInTouch ? 'true' : 'false'),
        payload.DriverPreferredContact.toString(),
        (payload.DriverWillTakeCare ? 'true' : 'false')
    ];
}
// for all two param Rider fns
function getTwoRiderCancelConfirmPayloadAsArray(req, payload) {
    if (req === undefined) {
        console.log("getCancelConfirmPayloadAsArray: no req");
    }
    if (payload === undefined) {
        console.log("getCancelConfirmPayloadAsArray: no payload");
    }
    if (payload.UUID === undefined) {
        console.log("getCancelConfirmPayloadAsArray: no payload UUID");
    }
    if (payload.RiderPhone === undefined) {
        console.log("getCancelConfirmPayloadAsArray: no payload RiderPhone");
    }
    return [
        payload.UUID, payload.RiderPhone
    ];
}
// for all two param Driver fns
function getTwoDriverCancelConfirmPayloadAsArray(req, payload) {
    if (req === undefined) {
        console.log("getCancelConfirmPayloadAsArray: no req");
    }
    if (payload === undefined) {
        console.log("getCancelConfirmPayloadAsArray: no payload");
    }
    if (payload.UUID === undefined) {
        console.log("getCancelConfirmPayloadAsArray: no payload UUID");
    }
    if (payload.DriverPhone === undefined) {
        console.log("getCancelConfirmPayloadAsArray: no payload DriverPhone");
    }
    return [
        payload.UUID, payload.DriverPhone
    ];
}
// for all three param Rider fns
function getThreeRiderCancelConfirmPayloadAsArray(req, payload) {
    if (req === undefined) {
        console.log("getCancelConfirmPayloadAsArray: no req");
    }
    if (payload === undefined) {
        console.log("getCancelConfirmPayloadAsArray: no payload");
    }
    if (payload.UUID_driver === undefined) {
        console.log("getCancelConfirmPayloadAsArray: no payload driver UUID");
    }
    if (payload.UUID_rider === undefined) {
        console.log("getCancelConfirmPayloadAsArray: no payload rider UUID");
    }
    if (payload.RiderPhone === undefined) {
        console.log("getCancelConfirmPayloadAsArray: no payload RiderPhone");
    }
    return [
        payload.UUID_driver, payload.UUID_rider, payload.RiderPhone
    ];
}
// for all four param Rider fns
function getFourRiderCancelConfirmPayloadAsArray(req, payload) {
    if (req === undefined) {
        console.log("getCancelConfirmPayloadAsArray: no req");
    }
    if (payload === undefined) {
        console.log("getCancelConfirmPayloadAsArray: no payload");
    }
    if (payload.UUID_driver === undefined) {
        console.log("getCancelConfirmPayloadAsArray: no payload driver UUID");
    }
    if (payload.UUID_rider === undefined) {
        console.log("getCancelConfirmPayloadAsArray: no payload rider UUID");
    }
    if (payload.RiderPhone === undefined) {
        console.log("getCancelConfirmPayloadAsArray: no payload RiderPhone");
    }
    return [
        payload.UUID_driver, payload.UUID_rider, payload.RiderPhone
    ];
}
// for all three param Driver fns
function getThreeDriverCancelConfirmPayloadAsArray(req, payload) {
    if (req === undefined) {
        console.log("getCancelConfirmPayloadAsArray: no req");
    }
    if (payload === undefined) {
        console.log("getCancelConfirmPayloadAsArray: no payload");
    }
    if (payload.UUID_driver === undefined) {
        console.log("getCancelConfirmPayloadAsArray: no payload driver UUID");
    }
    if (payload.UUID_rider === undefined) {
        console.log("getCancelConfirmPayloadAsArray: no payload rider UUID");
    }
    if (payload.DriverPhone === undefined) {
        console.log("getCancelConfirmPayloadAsArray: no payload DriverPhone");
    }
    return [
        payload.UUID_driver, payload.UUID_rider, payload.DriverPhone
    ];
}
// for all four param Driver fns
function getFourDriverCancelConfirmPayloadAsArray(req, payload) {
    if (req === undefined) {
        console.log("getCancelConfirmPayloadAsArray: no req");
    }
    if (payload === undefined) {
        console.log("getCancelConfirmPayloadAsArray: no payload");
    }
    if (payload.UUID_driver === undefined) {
        console.log("getCancelConfirmPayloadAsArray: no payload driver UUID");
    }
    if (payload.UUID_rider === undefined) {
        console.log("getCancelConfirmPayloadAsArray: no payload rider UUID");
    }
    if (payload.DriverPhone === undefined) {
        console.log("getCancelConfirmPayloadAsArray: no payload DriverPhone");
    }
    return [
        payload.UUID_driver, payload.UUID_rider, payload.DriverPhone
    ];
}
function getRejectRidePayloadAsArray(req, payload) {
    return [
        payload.UUID, payload.RiderPhone
    ];
}
function getConfirmRidePayloadAsArray(req, payload) {
    return [
        payload.UUID, payload.RiderPhone
    ];
}
function getCancelRidePayloadAsArray(req, payload) {
    return [
        payload.UUID, payload.RiderPhone
    ];
}
function getCancelRideOfferPayloadAsArray(req, payload) {
    return [
        payload.UUID, payload.DriverPhone
    ];
}
function sanitiseDriver(payload) {
    if (payload.DriverCollectionRadius === undefined ||
        payload.DriverCollectionRadius === "") {
        // console.log("santising...");
        payload.DriverCollectionRadius = 0;
    }
}
function sanitiseRider(payload) {
    // if (payload.RiderVotingState === undefined) {
    //   payload.RiderVotingState = "MO";
    // }
}
module.exports = {
    getAnon: getAnon,
    postDriver: postDriver,
    postRider: postRider,
    postHelper: postHelper,
    getUnmatchedDrivers: getUnmatchedDrivers,
    getUnmatchedRiders: getUnmatchedRiders,
    cancelRideRequest: cancelRideRequest,
    cancelRiderMatch: cancelRiderMatch,
    cancelDriveOffer: cancelDriveOffer,
    cancelDriverMatch: cancelDriverMatch,
    acceptDriverMatch: acceptDriverMatch,
    pauseDriverMatch: pauseDriverMatch,
    driverExists: driverExists,
    driverInfo: driverInfo,
    driverProposedMatches: driverProposedMatches,
    driverConfirmedMatches: driverConfirmedMatches,
    riderExists: riderExists,
    riderInfo: riderInfo,
    riderConfirmedMatch: riderConfirmedMatch,
    cancelRideOffer: cancelRideOffer,
    rejectRide: rejectRide,
    confirmRide: confirmRide,
    UNMATCHED_DRIVERS_ROUTE: UNMATCHED_DRIVERS_ROUTE,
    UNMATCHED_RIDERS_ROUTE: UNMATCHED_RIDERS_ROUTE,
    DRIVER_ROUTE: DRIVER_ROUTE,
    RIDER_ROUTE: RIDER_ROUTE,
    HELPER_ROUTE: HELPER_ROUTE,
    CANCEL_RIDE_REQUEST_ROUTE: CANCEL_RIDE_REQUEST_ROUTE,
    CANCEL_RIDER_MATCH_ROUTE: CANCEL_RIDER_MATCH_ROUTE,
    CANCEL_DRIVE_OFFER_ROUTE: CANCEL_DRIVE_OFFER_ROUTE,
    CANCEL_DRIVER_MATCH_ROUTE: CANCEL_DRIVER_MATCH_ROUTE,
    ACCEPT_DRIVER_MATCH_ROUTE: ACCEPT_DRIVER_MATCH_ROUTE,
    PAUSE_DRIVER_MATCH_ROUTE: PAUSE_DRIVER_MATCH_ROUTE,
    DRIVER_EXISTS_ROUTE: DRIVER_EXISTS_ROUTE,
    DRIVER_INFO_ROUTE: DRIVER_INFO_ROUTE,
    DRIVER_PROPOSED_MATCHES_ROUTE: DRIVER_PROPOSED_MATCHES_ROUTE,
    DRIVER_CONFIRMED_MATCHES_ROUTE: DRIVER_CONFIRMED_MATCHES_ROUTE,
    RIDER_EXISTS_ROUTE: RIDER_EXISTS_ROUTE,
    RIDER_INFO_ROUTE: RIDER_INFO_ROUTE,
    RIDER_CONFIRMED_MATCH_ROUTE: RIDER_CONFIRMED_MATCH_ROUTE,
    DELETE_DRIVER_ROUTE: DELETE_DRIVER_ROUTE,
    PUT_RIDER_ROUTE: PUT_RIDER_ROUTE,
    PUT_DRIVER_ROUTE: PUT_DRIVER_ROUTE,
    setPool: setPool
};
//# sourceMappingURL=routeFunctions.js.map