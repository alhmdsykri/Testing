namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("Location", Schema = "dbo")]
    public partial class Location
    {
        public Location()
        {
            InverseparentLocation = new HashSet<Location>();
        }

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int locationId { get; set; }
        public string? locationCode { get; set; }
        public string locationName { get; set; }
        public int locationTypeId { get; set; }
        public int? parentLocationId { get; set; }
        public string locationAddress { get; set; }
        public int? businessUnitId { get; set; }
        public string? businessUnitCode { get; set; }
        public string? businessUnitName { get; set; }
        public int? branchId { get; set; }
        public string? branchCode { get; set; }
        public string? branchName { get; set; }
        public int? cicoPoolType { get; set; }
        public int? customerId { get; set; }
        public int? customerContractId { get; set; }
        public int? vendorId { get; set; }
        public decimal latitude { get; set; }
        public decimal longitude { get; set; }
        public int? radius { get; set; }
        public string? workingHour { get; set; }
        public int timeOffset { get; set; }
        public string? storeCode { get; set; }
        public string? source { get; set; }
        public int status { get; set; }
        public string uniqueKey { get; set; }
        public int version { get; set; }
        public int createdBy { get; set; }
        public DateTime createdAt { get; set; }
        public int? modifiedBy { get; set; }
        public DateTime? modifiedAt { get; set; }
        public string? transactionId { get; set; }

        [ForeignKey("customerId")]
        public Customer? customer { get; set; }
        [ForeignKey("customerContractId")]
        public CustomerContract? customerContract { get; set; }
        [ForeignKey("locationTypeId")]
        public LocationType? locationType { get; set; }
        [ForeignKey("parentLocationId")]
        public Location? parentLocation { get; set; }
        [ForeignKey("vendorId")]
        public Vendor? vendor { get; set; }

        public ICollection<Location> InverseparentLocation { get; set; }
    }
}