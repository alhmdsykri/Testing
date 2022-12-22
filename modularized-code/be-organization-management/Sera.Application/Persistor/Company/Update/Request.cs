namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class UpdateCompanyRequest :
        ServiceBusRequest<UpdateCompanyModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class UpdateCompanyModel
    {
        public short companyId { get; set; }
        public string companyCode { get; set; }
        public string companyName { get; set; }
        public short? parentCompanyId { get; set; }
        public byte structureLevel { get; set; }
        public bool suspendFlag { get; set; }
        public bool sapIntegrated { get; set; }
        public bool isNameUpdated { get; set; }
    }
}