namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class DeleteVendorContractRequest :
        ServiceBusRequest<DeleteVendorContractModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class DeleteVendorContractModel
    {
        public int vendorContractId { get; set; }
    }
}
