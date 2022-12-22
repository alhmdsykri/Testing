namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class UpdateVendorContractRequest :
        ServiceBusRequest<UpdateVendorContractModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class UpdateVendorContractModel
    {
        public int vendorContractId { get; set; }
        public string contractNumber { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
    }
}
