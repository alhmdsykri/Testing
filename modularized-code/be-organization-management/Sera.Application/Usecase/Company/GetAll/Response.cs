namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetAllCompanyResponse 
    {
        public string CompanyId { get; set; }
        public string? CompanyCode { get; set; }
        public string CompanyName { get; set; }
        public GetAllParentCompanyResponse ParentCompany { get; set; }
        public byte StructureLevel { get; set; }
        public bool SuspendFlag { get; set; }
        public bool SAPIntegrated { get; set; }
        public List<ChildCompanyResponse> ChildCompany { get; set; }
    }

    [ExcludeFromCodeCoverage]
    public class GetAllParentCompanyResponse
    {
        public string CompanyId { get; set; }
        public string? CompanyCode { get; set; }
        public string CompanyName { get; set; }
        public byte StructureLevel { get; set; }
        public bool SuspendFlag { get; set; }
        public bool SAPIntegrated { get; set; }
    }

    [ExcludeFromCodeCoverage]
    public class GetAllChildCompanyResponse
    {
        public string CompanyId { get; set; }
        public string? CompanyCode { get; set; }
        public string CompanyName { get; set; }
        public string ParentCompanyId { get; set; }
        public string ParentCompanyName { get; set; }
        public byte StructureLevel { get; set; }
        public bool SuspendFlag { get; set; }
        public bool SAPIntegrated { get; set; }
        public List<ChildCompanyResponse> ChildCompany { get; set; }
    }
}

