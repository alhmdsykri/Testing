namespace Sera.Application.Constant
{
    public class AppConst
    {
        #region CONSTANTS
        public const int MAX_DAY_END_DATE = 1;
        #endregion

        #region DATA VERSION
        public const int DATA_VERSION = 1;
        public const string VEHICLE_SOURCE = "FMS";
        #endregion

        #region FUNCTION APP ACTION
        public const string FA_ACTION_CREATE_VEHICLE = "create-vehicle";
        public const string FA_ACTION_UPDATE_VEHICLE = "update-vehicle";
        public const string FA_ACTION_DELETE_VEHICLE = "delete-vehicle";
        public const string FA_ACTION_UPDATE_VEHICLE_TYPE = "delete-vehicle-type";

        public const string FA_ACTION_CQRS_PUT_VEHICLE_LOCATION = "vehicle_MSSQL_UpdateCQRSLocation";
        #endregion

        #region SERVICE BUS TOPIC NAME
        public const string VEHICLE_SERVICE_BUS_TOPIC_NAME = "sbt-vehicle";
        public const string VEHICLE_CQRS_SERVICE_BUS_TOPIC_NAME = "sbt-cqrs";
        
        #endregion

        #region SERVICE BUS SUBS NAME
        public const string VEHICLE_EVENT_SUBS_NAME = "vehicle-event-persistor";
        public const string VEHICLE_FIREBASE_SUBS_NAME = "vehicle-firebase-persistor";
        public const string VEHICLE_MSSQL_SUBS_NAME = "vehicle-mssql-persistor";

        public const string SERVICE_BUS_CQRS_VEHICLE_SUBS_NAME = "master-location-vehicle";
        #endregion

        #region COSMOS DB CONSTANTS
        /// <summary>
        /// Cosmos DB Vehicle Management database name
        /// </summary>
        public const string COSMOS_VEHICLE_DB_NAME = "VehicleManagement";
        #endregion

        #region RBAC FEATURE CONSTANTS
        public const string FEATURE_GET_VEHICLE_TYPE = "Vehicle_Microservice-GET-/vehicletype/{vehicleTypeId}";
        public const string FEATURE_FIND_VEHICLE_TYPE = "Vehicle_Microservice-GET-/vehicletype";
        public const string FEATURE_PUT_VEHICLE_TYPE = "Vehicle_Microservice-PUT-/vehicletype/{vehicleTypeId}";
        public const string FEATURE_GET_OVERVIEW_VEHICLE = "Vehicle_Microservice-GET-/vehicletype/{vehicleTypeId}/overview";

        public const string FEATURE_GET_VEHICLE = "Vehicle_Microservice-GET-/vehicle/{vehicleId}";
        public const string FEATURE_FIND_VEHICLE = "Vehicle_Microservice-GET-/vehicle";
        public const string FEATURE_POST_VEHICLE = "Vehicle_Microservice-POST-/vehicle";
        public const string FEATURE_PUT_VEHICLE = "Vehicle_Microservice-PUT-/vehicle/{vehicleId}";
        public const string FEATURE_DELETE_VEHICLE = "Vehicle_Microservice-DELETE-/vehicle/{vehicleId}";
        public const string FEATURE_GET_VEHICLE_REFERENCE = "Vehicle_Microservice-GET-/vehicle/vehicleReferences/{referenceName}";
        #endregion
    }
}