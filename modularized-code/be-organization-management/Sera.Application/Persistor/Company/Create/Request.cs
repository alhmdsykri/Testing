﻿namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public class CreateCompanyRequest :
        ServiceBusRequest<CreateCompanyModel>, IRequest<IResultStatus>
    { }

    [ExcludeFromCodeCoverage]
    public class CreateCompanyModel
    {
        public short companyId { get; set; }
        public string companyCode { get; set; }
        public string companyName { get; set; }
        public short? parentCompanyId { get; set; }
        public byte structureLevel { get; set; }
        public bool suspendFlag { get; set; }
        public bool sapIntegrated { get; set; }
    }
}