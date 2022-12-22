namespace Sera.Application.Constant
{
    public enum LocationSource
    {
        FMS = 1,
        VM = 2,
    }
    
    public enum ContractStatus
    {
        NOT_STARTED = 1,
        ACTIVE = 2,
        EXPIRING_SOON = 3,
        EXPIRED = 4
    }

    public enum VehicleStatus
    {
        FREE = 1,
        ON_CONTRACT = 2,
        ON_DUTY = 3,
        BREAKDOWN = 4,
        MISSING = 5
    }

    public enum ProductStatus
    {
        INACTIVE = 0,
        ACTIVE = 1,
        DELETE_IN = 2,
    }

}
