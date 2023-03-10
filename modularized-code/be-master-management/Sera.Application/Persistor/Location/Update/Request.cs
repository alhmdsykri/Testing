namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class UpdateLocationRequest :
        ServiceBusRequest<UpdateLocationModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class UpdateLocationModel
    {
        public int locationId { get; set; }
        public int locationTypeId { get; set; }
        public string locationName { get; set; }
        public int? cicoPoolType { get; set; }
        public int? businessUnitId { get; set; }
        public string? businessUnitName { get; set; }
        public int? branchId { get; set; }
        public string? branchName { get; set; }
        public int timeOffset { get; set; }
        public string? storeCode { get; set; }
        public string? workingHour { get; set; }
        public int? customerId { get; set; }
        public int? parentLocationId { get; set; }
        public int? customerContractId { get; set; }
        public int? vendorId { get; set; }
        public string locationAddress { get; set; }
        public decimal latitude { get; set; }
        public decimal longitude { get; set; }
        public int? radius { get; set; }
        public bool isNameUpdated { get; set; }
    }
}