namespace Sera.Common
{
    public enum HTTPMethod
    {
        POST = 1,
        GET = 2,
        PUT = 3,
        DELETE = 4
    }

    public enum Order
    {
        ASC = 0,
        DESC = 1,
    }

    public enum EventMethod
    {
        CREATE = 1,
        UPDATE = 2,
        DELETE = 3,
    }

    public enum CicoPoolType
    {
        OFFICE = 1,
        CUSTOMER = 2,
    }

    public enum DataSource
    {
        SAP = 1,
        FMS = 2,
        VM = 3,
    }

    public enum LocationType
    {
        TEMPORARYPOOL = 11,
        CUSTOMERLOCATION = 10,
        CUSTOMERPOOL = 9,
        POOL = 8,
        CICOPOOL = 7,
        VENDOR = 4,
        ADHOC = 3,
        CHECKPOINT = 2,
        SUBPOOL = 1,
    }

    public enum Period
    {
        YearToDate = 1,
        MonthToDate = 2
    }

    public enum AppType
    {
        FMS = 1,
        MobileDriver = 2,
        MobileQC = 3
    }

    public enum DRBACLevel
    {
        NONE = 0,
        DEFAULT=  1 ,
        COMPANY = 2,
        BUSINESSUNIT = 3,
        BRANCH = 4,
        LOCATION = 5
    }
}
