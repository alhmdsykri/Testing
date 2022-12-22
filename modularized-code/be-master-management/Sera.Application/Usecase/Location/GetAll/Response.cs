namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetAllLocationResponse
    {
        public int locationId { get; set; }
        public string? locationCode { get; set; }
        public string locationName { get; set; }
        public int locationTypeId { get; set; }
        public string locationTypeCode { get; set; }
        public string locationTypeName { get; set; }
        public int? businessUnitId { get; set; }
        public string businessUnitCode { get; set; }
        public string businessUnitName { get; set; }
        public int? branchId { get; set; }
        public string? branchCode { get; set; }
        public string? branchName { get; set; }
        public string locationAddress { get; set; }
        public string? source { get; set; }
    }
}