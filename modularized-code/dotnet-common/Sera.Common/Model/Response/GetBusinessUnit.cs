namespace Sera.Common.Model.Response
{
    [ExcludeFromCodeCoverage]
    public class GetBusinessUnit
    {
        public int businessUnitId { get; set; }
        public string businessUnitCode { get; set; }
        public string businessUnitName { get; set; }
        public int companyId { get; set; }
        public string companyCode { get; set; }
        public string companyName { get; set; }
        public bool sapIntegrated { get; set; }
    }
}
