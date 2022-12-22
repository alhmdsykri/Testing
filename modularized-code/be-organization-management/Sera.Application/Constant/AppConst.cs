namespace Sera.Application.Constant
{
    public class AppConst
    {
        #region CONSTANTS
        public const string COMPANY = "Company";
        public const string BUSINESS_UNIT = "Business unit";
        public const string BRANCH = "Branch";
        #endregion

        #region DATA VERSION
        public const int DATA_VERSION = 1;
        #endregion

        #region FUNCTION APP ACTION
        public const string FA_ACTION_CREATE_BRANCH = "create-branch";
        public const string FA_ACTION_UPDATE_BRANCH = "update-branch";
        public const string FA_ACTION_CQRS_UPDATE_BRANCH_USER = "User_MSSQL_UpdateCQRSBranch";
        public const string FA_ACTION_CQRS_UPDATE_BRANCH_ROUTE = "Route_MSSQL_UpdateCQRSBranch";

        public const string FA_ACTION_CREATE_COMPANY = "create-company";
        public const string FA_ACTION_UPDATE_COMPANY = "update-company";
        public const string FA_ACTION_CQRS_UPDATE_COMPANY = "User_MSSQL_UpdateCQRSCompany";

        public const string FA_ACTION_UPDATE_BUSINESSUNIT = "update-businessunit";
        public const string FA_ACTION_CQRS_UPDATE_BUSINESSUNIT = "User_MSSQL_UpdateCQRSBusinessUnit";
        #endregion

        #region SERVICE BUS TOPIC NAME
        public const string ORGANIZATION_SERVICE_BUS_TOPIC_NAME = "sbt-organization";
        #endregion

        #region SERVICE BUS SUBS NAME
        public const string ORGANIZATION_EVENT_SUBS_NAME = "organization-event-persistor";
        public const string ORGANIZATION_FIREBASE_SUBS_NAME = "organization-firebase-persistor";
        public const string ORGANIZATION_MSSQL_SUBS_NAME = "organization-mssql-persistor";

        // SUBS FILTER
        public const string SERVICE_BUS_CQRS_BRANCH_USER_SUBS_FILTER_NAME = "organization-branch-user";
        public const string SERVICE_BUS_CQRS_BRANCH_ROUTE_SUBS_FILTER_NAME = "organization-branch-route";
        public const string SERVICE_BUS_CQRS_BUSINESSUNIT_USER_SUBS_FILTER_NAME = "organization-business-unit-user";
        public const string SERVICE_BUS_CQRS_COMPANY_USER_SUBS_FILTER_NAME = "organization-company-user";
        public const string SERVICE_BUS_CQRS_BRANCH_USER_SUBS_DLQ_FILTER_NAME = "organization-branch-user-dlq";
        public const string SERVICE_BUS_CQRS_BRANCH_ROUTE_SUBS_DLQ_FILTER_NAME = "organization-branch-route-dlq";
        public const string SERVICE_BUS_CQRS_BUSINESSUNIT_USER_SUBS_DLQ_FILTER_NAME = "organization-business-unit-user-dlq";
        public const string SERVICE_BUS_CQRS_COMPANY_USER_SUBS_DLQ_FILTER_NAME = "organization-company-user-dlq";
        #endregion

        #region COSMOS DB CONSTANTS
        /// <summary>
        /// Cosmos DB Organization Management database name
        /// </summary>
        public const string COSMOS_ORGANIZATION_DB_NAME = "OrganizationManagement";
        #endregion

        #region RBAC FEATURE CONSTANTS
        public const string FEATURE_POST_COMPANY = "Organization_Microservice-POST-/company";
        public const string FEATURE_PUT_COMPANY = "Organization_Microservice-PUT-/company/{companyId}";
        public const string FEATURE_FIND_COMPANY = "Organization_Microservice-GET-/company";
        public const string FEATURE_GET_COMPANY = "Organization_Microservice-GET-/company/{companyId}";
        public const string FEATURE_GET_ALL_COMPANY = "Organization_Microservice-GET-/company/all";

        public const string FEATURE_FIND_BU = "Organization_Microservice-GET-/businessunit";
        public const string FEATURE_GET_BU = "Organization_Microservice-GET-/businessunit/{businessUnitId}";
        public const string FEATURE_PUT_BU = "Organization_Microservice-PUT-/businessunit/{businessUnitId}";
        public const string FEATURE_GET_ALL_BU = "Organization_Microservice-GET-/businessunit/all";

        public const string FEATURE_POST_BRANCH = "Organization_Microservice-POST-/branch";
        public const string FEATURE_PUT_BRANCH = "Organization_Microservice-PUT-/branch/{branchId}";
        public const string FEATURE_FIND_BRANCH = "Organization_Microservice-GET-/branch";
        public const string FEATURE_GET_BRANCH = "Organization_Microservice-GET-/branch/{branchId}";
        public const string FEATURE_GET_ALL_BRANCH = "Organization_Microservice-GET-/branch/all";

        public const string FEATURE_FIND_REGION = "Organization_Microservice-GET-/region";
        public const string FEATURE_GET_REGION = "Organization_Microservice-GET-/region/{regionId}";
        #endregion
    }
}