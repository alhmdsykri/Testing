namespace Sera.Application.Constant
{
    public class AppConst
    {
        #region CONSTANTS
        public const int MAX_DAY_TEMP_DELETE = 2;
        public const int MAX_DAY_END_DATE = 1;
        public const string LOCATION = "Location";
        public const string FLEETX = "FleetX";

        public const string BUSINESS_UNIT_DATA_FOUND = "Business Unit data found.";
        public static readonly int[] LOCATION_TYPE_TO_USER = { (int)LocationType.SUBPOOL, (int)LocationType.POOL, (int)LocationType.CUSTOMERPOOL };

        #endregion

        #region DATA VERSION
        public const int DATA_VERSION = 1;
        #endregion

        #region FUNCTION APP ACTION
        public const string FA_ACTION_CREATE_LOCATION = "create-location";
        public const string FA_ACTION_UPDATE_LOCATION = "update-location";
        public const string FA_ACTION_DELETE_LOCATION = "delete-location";
        public const string FA_ACTION_CQRS_UPDATE_LOCATION = "User_MSSQL_UpdateCQRSLocation";
        public const string FA_ACTION_CQRS_CREATE_LOCATION = "User_MSSQL_CreateCQRSLocation";
        public const string FA_ACTION_CQRS_DELETE_LOCATION = "User_MSSQL_DeleteCQRSLocation";
        public const string FA_ACTION_ROUTE_CQRS_UPDATE_LOCATION = "route_MSSQL_UpdateCQRSLocation";
        public const string FA_ACTION_VEHICLE_CQRS_UPDATE_LOCATION = "vehicle_MSSQL_UpdateCQRSLocation";
        public const string FA_ACTION_CREATE_LOCATION_VM = "create-location-vm";
        public const string FA_ACTION_DELETE_LOCATION_VM = "delete-location-vm";
        public const string FA_ACTION_UPDATE_LOCATION_VM = "update-location-vm";

        public const string FA_ACTION_DELETE_PRODUCT = "delete-product";
        public const string FA_ACTION_UPDATE_PRODUCT = "update-product";
        public const string FA_ACTION_CREATE_PRODUCT = "create-product";
        
        public const string FA_ACTION_CREATE_VENDOR_CONTRACT = "create-vendor-contract";
        public const string FA_ACTION_UPDATE_VENDOR_CONTRACT = "update-vendor-contract";
        public const string FA_ACTION_DELETE_VENDOR_CONTRACT = "delete-vendor-contract";

        public const string FA_ACTION_UPDATE_CONTRACT = "update-contract";
        public const string FA_ACTION_CONTRACT_STATUS_UPDATER = "contract-status-updater";

        public const string FA_ACTION_UPDATE_CONTRACT_ITEM = "update-contract-item";
        public const string FA_ACTION_CREATE_CONTRACT_ITEM = "create-contract-item";

        public const string FA_ACTION_CREATE_CONTRACT = "create-contract";

        public const string FA_ACTION_CREATE_CUSTOMER_CONTACT = "create-customer-contact";
        public const string FA_ACTION_CREATE_CUSTOMER_FUNCTION = "create-customer-function";

        public const string CUSTOMER_CONTRACT_ITEM = "CustomerContractItem";
        #endregion

        #region SERVICE BUS TOPIC NAME
        public const string MASTER_SERVICE_BUS_TOPIC_NAME = "sbt-master";
        public const string CQRS_SERVICE_BUS_TOPIC_NAME = "sbt-cqrs";
        #endregion

        #region SERVICE BUS SUBS NAME
        public const string MASTER_EVENT_SUBS_NAME = "master-event-persistor";
        public const string MASTER_FIREBASE_SUBS_NAME = "master-firebase-persistor";
        public const string MASTER_MSSQL_SUBS_NAME = "master-mssql-persistor";

        public const string SERVICE_BUS_CQRS_LOCATION_USER_SUBS_FILTER_NAME = "master-location-user";
        public const string SERVICE_BUS_CQRS_LOCATION_USER_SUBS_DLQ_FILTER_NAME = "master-location-user-dlq";

        public const string SERVICE_BUS_CQRS_LOCATION_ROUTE_SUBS_FILTER_NAME = "master-location-route";
        public const string SERVICE_BUS_CQRS_LOCATION_ROUTE_SUBS_DLQ_FILTER_NAME = "master-location-route-dlq";

        public const string SERVICE_BUS_CQRS_LOCATION_VEHICLE_SUBS_FILTER_NAME = "master-location-vehicle";
        public const string SERVICE_BUS_CQRS_LOCATION_VEHICLE_SUBS_DLQ_FILTER_NAME = "master-location-vehicle-dlq";
        #endregion

        #region COSMOS DB CONSTANTS
        /// <summary>
        /// Cosmos DB Master Management database name
        /// </summary>
        public const string COSMOS_MASTER_DB_NAME = "MasterManagement";
        #endregion

        #region RBAC FEATURE CONSTANTS
        public const string FEATURE_GET_CUSTOMER = "Master_Microservice-GET-/customer/{customerId}";
        public const string FEATURE_FIND_CUSTOMER = "Master_Microservice-GET-/customer";
        public const string FEATURE_GET_CUSTOMER_TOP_BOTTOM = "Master_Microservice-GET-/customer/topbottom";

        public const string FEATURE_GET_CUSTOMER_CONTRACT = "Master_Microservice-GET-/customer/contract";

        public const string FEATURE_FIND_LOCATION = "Master_Microservice-GET-/location";
        public const string FEATURE_POST_LOCATION = "Master_Microservice-POST-/location";
        public const string FEATURE_PUT_LOCATION = "Master_Microservice-PUT-/location/{locationId}";
        public const string FEATURE_GET_LOCATION = "Master_Microservice-GET-/location/{locationId}";
        public const string FEATURE_DELETE_LOCATION = "Master_Microservice-DELETE-/location/{locationId}";
        public const string FEATURE_GET_BY_MULTIPLE_ID_LOCATION = "Master_Microservice-GET-/location/multiplelocationid";
        public const string FEATURE_GET_LOCATION_CHECK = "Master_Microservice-GET-/location/check";
        public const string FEATURE_GET_LOCATIONS = "Master_Microservice-GET-/location/locations";
        public const string FEATURE_GET_VALID_LOCATION = "Master_Microservice-GET-/location/{locationId}/used";
        public const string FEATURE_GET_READY_FOR_MODIFICATION_LOCATION = "Master_Microservice-GET-/location/{locationId}/readyformodification";
        public const string FEATURE_GET_ALL_LOCATION = "Master_Microservice-GET-/location/all";
        
        public const string FEATURE_POST_VENDOR_CONTRACT = "Master_Microservice-POST-/vendor/{vendorId}/contract";
        public const string FEATURE_FIND_VENDOR_CONTRACT = "Master_Microservice-GET-/vendor/contract";
        public const string FEATURE_GET_VENDOR = "Master_Microservice-GET-/vendor/{vendorId}";
        public const string FEATURE_GET_VENDOR_CONTRACT = "Master_Microservice-GET-/vendor/{vendorId}/contract";
        public const string FEATURE_PUT_VENDOR_CONTRACT = "Master_Microservice-PUT-/vendor/{vendorId}/contract/{vendorContractId}";
        public const string FEATURE_DELETE_VENDOR_CONTRACT = "Master_Microservice-DELETE-/vendor/{vendorId}/contract/{vendorContractId}";
        public const string FEATURE_FIND_VENDOR = "Master_Microservice-GET-/vendor";
        public const string FEATURE_GET_OVERVIEW_VENDOR_CONTRACT = "Master_Microservice-GET-/vendorcontract/overview";
        public const string FEATURE_GET_VENDOR_CONTRACT_DETAIL = "Master_Microservice-GET-/vendorcontract/{vendorContractId}";

        public const string FEATURE_DELETE_PRODUCT = "Master_Microservice-DELETE-/product/{productId}";
        public const string FEATURE_GET_PRODUCT = "Master_Microservice-GET-/product/{productId}";
        public const string FEATURE_FIND_PRODUCT = "Master_Microservice-GET-/product";
        public const string FEATURE_UPDATE_PRODUCT = "Master_Microservice-PUT-/product/{productId}";
        public const string FEATURE_POST_PRODUCT = "Master_Microservice-POST-/product";

        public const string FEATURE_FIND_CONTRACT = "Master_Microservice-GET-/contract";
        public const string FEATURE_GET_OVERVIEW_CONTRACT = "Master_Microservice-GET-/contract/overview/{businessUnitId}";
        public const string FEATURE_GET_CONTRACT = "Master_Microservice-GET-/contract/{contractId}";
        public const string FEATURE_PUT_CONTRACT = "Master_Microservice-PUT-/contract/{contractId}";

        public const string FEATURE_FIND_CONTRACT_ITEM = "Master_Microservice-GET-/contract/{contractId}/item";
        public const string FEATURE_GET_CONTRACT_ITEM = "Master_Microservice-GET-/contract/{contractId}/item/{contractItemId}";
        public const string FEATURE_POST_CONTRACT_ITEM = "Master_Microservice-POST-/contract/{contractId}/item";
        public const string FEATURE_POST_CONTRACT = "Master_Microservice-POST-/contract";

        public const string FEATURE_GET_CUSTOMER_CONTACT = "Master_Microservice-GET-/customer/contact/{customerContactId}";
        public const string FEATURE_FIND_CUSTOMER_CONTACT = "Master_Microservice-GET-/customer/{customerId}/contact";
        public const string FEATURE_POST_CUSTOMER_CONTACT = "Master_Microservice-POST-/customer/{customerId}/contact";

        public const string FEATURE_GET_UOM = "Master_Microservice-GET-/uom";

        public const string FEATURE_GET_MATERIAL = "Master_Microservice-GET/material";
        #endregion

        #region SEQUENCE FEATURE CONSTANTS        
        public const string SEQUENCE_LOCATION = "mt_location_sequence";
        public const string SEQUENCE_CONTRACT = "mt_contract_sequence";
        public const string SEQUENCE_CUSTOMER_CONTACT = "mt_customer_contact_sequence";
        #endregion

        #region AZURE FUNCTION APPLICATION CONFIGURATION
        /// <summary>
        /// Azure Function application configuration name for retrieving Azure Service Bus connection string
        /// </summary>
        public const string FA_BASE_URL_ORGANIZATION_NAME = "ASTRA_FMS_BASE_URL_ORGANIZATION";
        public const string FA_BASE_URL_ROUTE_NAME = "ASTRA_FMS_BASE_URL_ROUTE";
        public const string FA_BASE_URL_VEHICLE_NAME = "ASTRA_FMS_BASE_URL_VEHICLE";
        public const string FA_BASE_URL_DRIVER_NAME = "ASTRA_FMS_BASE_URL_DRIVER";
        public const string FA_BASE_URL_USER_NAME = "ASTRA_FMS_BASE_URL_USER";
        public const string FA_BASE_URL_MASTER_NAME = "ASTRA_FMS_BASE_URL_MASTER";
        #endregion

        #region Entity Cosmos Purpose
        public const string ENTITY_LOCATION = "Location";
        #endregion
    }
}