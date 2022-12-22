namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("LocationType", Schema = "dbo")]
    public partial class LocationType
    {
        public LocationType()
        {
            Location = new HashSet<Location>();
        }

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int locationTypeId { get; set; }
        public string locationTypeCode { get; set; }
        public string locationTypeName { get; set; }
        public string icon { get; set; }
        public bool submitDocumentFlag { get; set; }
        public int status { get; set; }
        public string uniqueKey { get; set; }
        public int version { get; set; }
        public int createdBy { get; set; }
        public DateTime createdAt { get; set; }
        public int? modifiedBy { get; set; }
        public DateTime? modifiedAt { get; set; }

        [InverseProperty("locationType")]
        public ICollection<Location> Location { get; set; }
    }
}