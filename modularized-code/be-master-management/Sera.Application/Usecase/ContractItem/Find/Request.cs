namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class FindContractItemRequest : IRequest<Response<IEnumerable<FindContractItemResponse>>>
    {
        public int contractId { get; set; }
        public string? materialCode { get; set; }
        public string? materialName { get; set; }
        public string? vehicleTypeCode { get; set; }
        public string? vehicleTypeName { get; set; }
        public int? lineItemNumber { get; set; }
        public int? numberOfDriver { get; set; }
        public int? quantity { get; set; }
        public string? UOMCode { get; set; }
        public string? branchCode { get; set; }
        public string? branchName { get; set; }

        [DefaultValue(CommonConst.MIN_PAGE)]
        public int page { get; set; } = CommonConst.MIN_PAGE;

        [DefaultValue(CommonConst.MIN_ROW)]
        public int row { get; set; } = CommonConst.MIN_ROW;

    }
}