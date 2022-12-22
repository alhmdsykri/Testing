using System.ComponentModel;

namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("Customer", Schema = "dbo")]
    public partial class Customer
    {
        public Customer()
        {
            CustomerContract = new HashSet<CustomerContract>();
            Location = new HashSet<Location>();
        }

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int customerId { get; set; }
        public string customerName { get; set; }
        public string customerCode { get; set; }
        public string customerAddress { get; set; }
        public string accountGroupSAP { get; set; }
        public bool? isBlocked { get; set; }
        public bool? isB2B { get; set; }
        public string customerLogo { get; set; }
        public int status { get; set; }
        public string uniqueKey { get; set; }
        public int version { get; set; }
        public int createdBy { get; set; }
        public DateTime createdAt { get; set; }
        public int modifiedBy { get; set; }
        public DateTime? modifiedAt { get; set; }

        [InverseProperty("customer")]
        public ICollection<CustomerContract> CustomerContract { get; set; }
        [InverseProperty("customer")]
        public ICollection<Location> Location { get; set; }
    }
}