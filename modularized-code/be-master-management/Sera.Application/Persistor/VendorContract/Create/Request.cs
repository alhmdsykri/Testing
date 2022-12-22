namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class CreateVendorContractRequest :
        ServiceBusRequest<CreateVendorContractModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class CreateVendorContractModel
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
