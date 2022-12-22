namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]  
    public class CreateLocationCQRSRequest
    {
        public int? companyId { get; set; }
        public string? companyCode { get; set; }
        public string? companyName { get; set; }
        public int? businessUnitId { get; set; }
        public string? businessUnitCode { get; set; }
        public string? businessUnitName { get; set; }
        public int? branchId { get; set; }
        public string? branchCode { get; set; }
        public string? branchName { get; set; }
        public int locationId { get; set; }
        public string? locationCode { get; set; }
        public string locationName { get; set; }
    }
}
