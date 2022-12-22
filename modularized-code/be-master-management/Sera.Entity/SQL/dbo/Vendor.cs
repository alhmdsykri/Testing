namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("Vendor", Schema = "dbo")]
    public partial class Vendor
    {
        public Vendor()
        {
            Location = new HashSet<Location>();
        }

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int vendorId { get; set; }
        public string vendorName { get; set; }
        public string vendorCode { get; set; }
        public string contactPerson { get; set; }
        public int status { get; set; }
        public string uniqueKey { get; set; }
        public int version { get; set; }
        public int createdBy { get; set; }
        public DateTime createdAt { get; set; }
        public int? modifiedBy { get; set; }
        public DateTime? modifiedAt { get; set; }

        [InverseProperty("vendor")]
        public ICollection<Location> Location { get; set; }
    }
}