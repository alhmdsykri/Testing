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
        ONCONTRACT = 2,
        ONDUTY = 3,
        BREAKDOWN = 4,
        UNAVAILABLE = 5,
        MISSING = 6
    }
}
