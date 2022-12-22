namespace Sera.Application.Constant
{
    public class AppConst
    {
        #region CONSTANTS
        public const int MAX_DAY_TEMP_DELETE = 2;
        public const int MAX_DAY_END_DATE = 1;
        public const string ROUTE = "Route";
        public const string ROUTE_LOCATION = "RouteLocation";
        public const string TRIP_EXPENSE = "Trip Expense";
        public const string PRODUCT_VEHICLE_TYPE = "Product Vehicle Type";
        public const string EXPENSE_VALUE = "Expense Value";
        public const string REVENUE = "Revenue";

        public const string INTERNAL = "Internal";
        public const string FIXED = "Fixed";

        public const string LOCATION_SUCESS_MESSAGE = "Location data found.";
        #endregion

        #region DATA VERSION
        public const int DATA_VERSION = 1;
        #endregion

        #region FUNCTION APP ACTION
        public const string FA_ACTION_POST_ROUTE = "routeCreate";
        public const string FA_ACTION_POST_ROUTE_LOCATION = "create-route-location";
        public const string FA_ACTION_PUT_ROUTE_LOCATION = "update-route-location";
        public const string FA_ACTION_PUT_ROUTE_FMS = "update-route-FMS";

        public const string FA_ACTION_PUT_ACTIVITY_ROUTE_LOCATION = "update-activity-route-location";

        public const string FA_ACTION_POST_ROUTE_TRIP_EXPENSE = "create-route-trip-expense";
        public const string FA_ACTION_POST_ROUTE_PRODUCT_VEHICLE_TYPE = "create-route-product-vehicle-type"; 
        public const string FA_ACTION_POST_ROUTE_EXPENSE_VALUE = "create-route-expense-value";
        public const string FA_ACTION_POST_ROUTE_REVENUE = "create-route-revenue";

        public const string FA_ACTION_PUT_ROUTE_COMPLETION_STATUS = "update-route-completion-status";
        public const string FA_ACTION_PUT_ROUTE_STATUS_PRODUCT_VEHICLE_TYPE = "update-route-status-product-vehicle-type";
        public const string FA_ACTION_PUT_ROUTE_COMPLETION_STATUS_UPDATE_TRIP_EXPENSE = "update-route-completion-status-update-trip-expense";
        public const string FA_ACTION_PUT_ROUTE_COMPLETION_STATUS_FROM_ROUTE_LOCATION = "update-route-completion-status-update-from-route-location";
        public const string FA_ACTION_PUT_ROUTE_STATUS_FROM_CREATE_ROUTE_LOCATION = "update-route-status-update-from-create-route-location";

        public const string FA_ACTION_PUT_ROUTE_STATUS_TRIPEXPENSE = "update-route-status-tripexpense";

        public const string FA_ACTION_PUT_ROUTE_TRIP_EXPENSE = "update-route-trip-expense";
        public const string FA_ACTION_PUT_ROUTE_PRODUCT_VEHICLE_TYPE = "update-route-product-vehicle-type";
        public const string FA_ACTION_PUT_ROUTE_EXPENSEVALUE = "update-route-expensevalue";
        public const string FA_ACTION_PUT_ROUTE_EXPENSE_VALUE = "update-route-expense-value";
        public const string FA_ACTION_PUT_ROUTE_REVENUE = "update-route-revenue";

        public const string FA_ACTION_PUT_ROUTE_STATUS_SINGLE_TRIPEXPENSE = "update-route-status-single-tripexpense";
        public const string FA_ACTION_PUT_ROUTE_STATUS_MULTIPLE_TRIP_EXPENSE = "update-route-status-multiple-tripexpense";

        public const string FA_ACTION_CQRS_PUT_ROUTE_LOCATION = "route_MSSQL_UpdateCQRSLocation";
        public const string FA_ACTION_CQRS_PUT_ROUTE = "route_MSSQL_UpdateCQRSRoute";
        public const string FA_ACTION_CQRS_UPDATE_BRANCH_ROUTE = "Route_MSSQL_UpdateCQRSBranch";
        public const string FA_ACTION_CQRS_UPDATE_CUSTOMER_ROUTE = "Route_MSSQL_UpdateCQRSCustomer";

        public const string FA_ACTION_DELETE_ROUTE_FMS = "delete-route-FMS";
        public const string FA_ACTION_DELETE_ROUTE_LOCATION_FMS = "delete-route-location-FMS";

        public const string FA_ACTION_PUT_ROUTE_REACTIVATE = "reactivate-route-vm";
        public const string FA_ACTION_PUT_ROUTE_DEACTIVATE = "deactivate-route-vm";

        public const string FA_ACTION_PUT_ROUTE_UPDATE_DEPARTURE_POOL = "update-route-departure-pool";
        public const string FA_ACTION_PUT_ROUTE_UPDATE_ARRIVAL_POOL = "update-route-arrival-pool";
        #endregion

        #region SERVICE BUS TOPIC NAME
        public const string ROUTES_SERVICE_BUS_TOPIC_NAME = "sbt-route";
        public const string ROUTES_CQRS_SERVICE_BUS_TOPIC_NAME = "sbt-cqrs";
        #endregion

        #region SERVICE BUS SUBS NAME
        public const string ROUTES_EVENT_SUBS_NAME = "route-event-persistor";
        public const string ROUTES_FIREBASE_SUBS_NAME = "route-firebase-persistor";
        public const string ROUTES_MSSQL_SUBS_NAME = "route-mssql-persistor";

        public const string SERVICE_BUS_MSSQL_ROUTE_FILTER_NAME = "mssql-persistor";
        public const string ROUTES_CQRS_LOCATION_SUBS_NAME = "master-location-route";
        public const string ROUTES_CQRS_BRANCH_SUBS_NAME = "organization-branch-route";
        public const string ROUTES_CQRS_CUSTOMER_SUBS_NAME = "master-customer-route";
        #endregion

        #region COSMOS DB CONSTANTS
        /// <summary>
        /// Cosmos DB Route Management database name
        /// </summary>
        public const string COSMOS_ROUTE_DB_NAME = "RouteManagement";
        #endregion

        #region RBAC FEATURE CONSTANTS
        public const string FEATURE_FIND_ROUTE = "Route_Microservice-GET-/route";
        public const string FEATURE_GET_OVERVIEW_ROUTE = "Route_Microservice-GET-/route/overview";
        public const string FEATURE_UPDATE_ROUTE_FMS = "Route_Microservice-PUT-/route/{routeId}";
        public const string FEATURE_GET_ROUTE_KML = "Route_Microservice-GET-/route/{routeId}/kml";
        public const string FEATURE_GET_ROUTE = "Route_Microservice-GET-/route/{routeId}";
        public const string FEATURE_GET_ROUTE_LOCATION = "Route_Microservice-GET-/route/{routeId}/routelocation";
        public const string FEATURE_GET_ROUTE_ACTIVITIES = "Route_Microservice-GET-/route/{routeId}/activities";
        public const string FEATURE_GET_ROUTE_ACTION = "Route_Microservice-GET-/route/action/{preNextAction}";
        public const string FEATURE_UPDATE_ROUTE_LOCATION_ACTIVITIES = "Route_Microservice-PUT-/route/routelocation/activity";
        public const string FEATURE_CREATE_ROUTE_TRIPEXPENSE = "Route_Microservice-POST-/route/{routeId}/tripexpense";
        public const string FEATURE_UPDATE_ROUTE_TRIPEXPENSE = "Route_Microservice-PUT-/route/{routeId}/tripexpense";
        public const string FEATURE_GET_TRIP_EXPENSE_LIST = "Route_Microservice-GET-/route/{routeId}/tripexpense";
        public const string FEATURE_GET_TRIP_EXPENSE_CATEGORY_LIST = "Route_Microservice-GET-/route/expenseCategory/{affectedBranchId}";
        public const string FEATURE_GET_TRIP_EXPENSE_DETAIL = "Route_Microservice-GET-/route/{routeId}/tripexpense/{tripExpenseId}";
        public const string FEATURE_GET_TRIP_EXPENSE_READY_FOR_MODIFICATION = "Route_Microservice-GET-/route/{routeId}/tripexpense/{tripExpenseId}/readyformodification";
        public const string FEATURE_UPDATE_ROUTE_REACTIVATE = "Route_Microservice-PUT-/route/{routeId}/reactivate";
        public const string FEATURE_UPDATE_ROUTE_DEACTIVATE = "Route_Microservice-PUT-/route/{routeId}/deactivate";
        public const string FEATURE_UPDATE_DEPARTURE_POOL = "Route_Microservice-PUT-/route/{routeId}/departure";
        public const string FEATURE_UPDATE_ARRIVAL_POOL = "Route_Microservice-PUT-/route/{routeId}/arrival";

        #endregion

        #region SEQUENCE FEATURE CONSTANTS
        //public const string SEQUENCE_LOCATION = "mt_location_sequence";
        #endregion

        /// <summary>
        /// Azure Function application configuration name for retrieving Azure Service Bus connection string
        /// </summary>
        public const string FA_BASE_URL_MASTER_NAME = "ASTRA_FMS_BASE_URL_MASTER";
        public const string FA_BASE_URL_USER_NAME = "ASTRA_FMS_BASE_URL_USER";
        public const string FA_BASE_URL_ROUTE = "ASTRA_FMS_BASE_URL_ROUTE";
        public const string GAP_TRESHOLD = "GAP_TRESHOLD_FOR_DLQ";
    }
}
