namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class FindVendorContractRequest : IRequest<Response<IEnumerable<FindVendorContractResponse>>>
    {
        public string? VMDNo { get; set; }
        public string? vendorName { get; set; }
        public string? vendorContractNumber { get; set; }
        public string? vendorContractType { get; set; }
        public int? status { get; set; }

        [DefaultValue(CommonConst.MIN_PAGE)]
        public int page { get; set; } = CommonConst.MIN_PAGE;

        [DefaultValue(CommonConst.MIN_ROW)]
        public int row { get; set; } = CommonConst.MIN_ROW;

        [DefaultValue("ASC")]
        public Order orderBy { get; set; } = Order.ASC;

        [DefaultValue("vendorName")]
        public SortVendorContract sortBy { get; set; } = SortVendorContract.vendorName;
    }

    public enum SortVendorContract
    {
        vendorName = 1,
        VMDNo = 2,
        vendorContractNumber = 3,
        vendorContractType = 4,
        status = 5

    }  
}