namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class UpdateVehicleTypeRequest :
        ServiceBusRequest<UpdateVehicleTypeModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class UpdateVehicleTypeModel
    {
        public int vehicleTypeId { get; set; }
        public int driverLicenseTypeId { get; set; }
        public string driverLicenseTypeCode { get; set; }
        public string driverLicenseTypeName { get; set; }
        public string description { get; set; }
    }
}
