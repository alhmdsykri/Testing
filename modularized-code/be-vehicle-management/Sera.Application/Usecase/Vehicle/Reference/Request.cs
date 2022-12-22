namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetVehicleReferenceRequest : IRequest<Response<IEnumerable<GetVehicleReferenceResponse>>>
    {
        public VehicleReferenceType referenceName { get; set; }
    }

    public enum VehicleReferenceType
    {
        BRAND = 1,
        CATEGORY = 2,
        MODEL = 3,
        COLOR = 4,
        FUELTYPE = 5,
    }
}