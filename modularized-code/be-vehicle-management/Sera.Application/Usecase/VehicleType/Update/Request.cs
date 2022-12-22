namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class UpdateVehicleTypeRequest : IRequest<Response>
    {
        public int vehicleTypeId { get; set; }
        public int driverLicenseTypeId { get; set; }
        public string driverLicenseTypeCode { get; set; }
        public string driverLicenseTypeName { get; set; }
        public string description { get; set; }
    }
}
