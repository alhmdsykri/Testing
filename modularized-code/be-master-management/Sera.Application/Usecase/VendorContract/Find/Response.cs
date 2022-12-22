namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class FindVendorContractResponse
    {
        public string VMDNo { get; set; }
        public string vendorName { get; set; }
        public string vendorContractNumber { get; set; }
        private string vendorcontractype { get; set; }
        public string vendorContractType { 
            get
            {
                return vendorcontractype;
            }
            set
            {
                if (value == "01")
                {
                    value = "Unit";
                }
                if (value == "02")
                {
                    value = "Driver";
                }
                if (value == "03")
                {
                    value = "Unit & Driver";
                }

                this.vendorcontractype = value;
            }
        }

        public string status { get; set; }
        public int vendorId { get; set; }
    }
}