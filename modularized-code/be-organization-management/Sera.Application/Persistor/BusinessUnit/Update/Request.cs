namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class UpdateBusinessUnitRequest :
        ServiceBusRequest<UpdateBusinessUnitModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class UpdateBusinessUnitModel
    {
        public int businessUnitId { get; set; }
        public string businessUnitCode { get; set; }
        public string businessUnitName { get; set; }
        public short companyId { get; set; }
        public bool sapIntegrated { get; set; }
        public bool isNameUpdated { get; set; }
    }
}
