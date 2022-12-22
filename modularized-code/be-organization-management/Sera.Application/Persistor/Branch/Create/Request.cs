namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class CreateBranchRequest :
        ServiceBusRequest<CreateBranchModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class CreateBranchModel
    {
        public int branchId { get; set; }
        public string branchCode { get; set; }
        public string branchName { get; set; }
        public int businessUnitId { get; set; }
        public int regionId { get; set; }
        public bool sapIntegrated { get; set; }
    }
}