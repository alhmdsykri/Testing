namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class CreateVendorContractRequest : IRequest<Response>
    {
        public int vendorId { get; set; }
        public List<VendorContractModel> contract { get; set; }
    }

    [ExcludeFromCodeCoverage]
    public class VendorContractModel
    {
        public string contractNumber { get; set; }
        public string contractType { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
        public int businessUnitId { get; set; }
        public string businessUnitCode { get; set; }
        public string businessUnitName { get; set; }
        public int companyId { get; set; }
        public string companyCode { get; set; }
        public string companyName { get; set; }
    }
}
