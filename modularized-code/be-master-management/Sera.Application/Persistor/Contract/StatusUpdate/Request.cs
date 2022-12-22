namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class ContractStatusUpdateRequest :
        ServiceBusRequest<UpdateContractModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class ContractStatusUpdate
    {
        public int contractId { get; set; }
    }
}
