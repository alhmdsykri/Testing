namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetValidLocationResponse
    {
        public bool isValid { get; set; } = false;
    }

    [ExcludeFromCodeCoverage]
    public class RouteLocationDataModel
    {
        public int routelocationId { get; set; }
    }

    [ExcludeFromCodeCoverage]
    public class RouteDataModel
    {
        public int departurePoolId { get; set; }
    }

    [ExcludeFromCodeCoverage]
    public class VehicleDataModel
    {
        public int vehicleId { get; set; }
    }

    [ExcludeFromCodeCoverage]
    public class DriverUserDataModel
    {
        public bool isValid { get; set; }
    }
}