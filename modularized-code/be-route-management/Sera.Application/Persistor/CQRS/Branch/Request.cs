namespace Sera.Application.Persistor.CQRS
{
    [ExcludeFromCodeCoverage]
    public class CQRSUpdateBranchRequest :
        ServiceBusRequest<CQRSUpdateBranch>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class CQRSUpdateBranch
    {
        public int branchId { get; set; }
        public string branchCode { get; set; }
        public string branchName { get; set; }
    }
}
