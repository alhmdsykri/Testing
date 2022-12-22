namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetLocationResponse
    {
        public int LocationId { get; set; }
        public string LocationName { get; set; }
        public int? BusinessUnitId { get; set; }
        public string? BusinessUnitCode { get; set; }
        public string? BusinessUnitName { get; set; }
        public int? BranchId { get; set; }
        public string? BranchCode { get; set; }
        public string? BranchName { get; set; }
        public int LocationTypeId { get; set; }
        public string LocationTypeCode { get; set; }
        public string LocationTypeName { get; set; }
        public int? ParentLocationId { get; set; }
        public string LocationAddress { get; set; }
        public int? CustomerId { get; set; }
        public string? CustomerCode { get; set; }
        public string? CustomerName { get; set; }
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public int? Radius { get; set; }
        public string? WorkingHour { get; set; }
        public int TimeOffset { get; set; }
        public string? StoreCode { get; set; }
        public int? CicoPoolType { get; set; }
        public string? CicoPoolTypeName { get; set; }
        public int? CustomerContractId { get; set; }
        public string? ContractNumber { get; set; }
        public int? VendorId { get; set; }
        public string? VendorName { get; set; }
        public string Source { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? ModifiedAt { get; set; }
    }
}