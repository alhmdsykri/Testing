namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("VehicleCategory", Schema = "dbo")]
    public partial class VehicleCategory
    {
        public VehicleCategory()
        {
            Vehicle = new HashSet<Vehicle>();
        }

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int vehicleCategoryId { get; set; }
        public string vehicleCategoryCode { get; set; }
        public string vehicleCategoryName { get; set; }
        public int status { get; set; }
        public int createdBy { get; set; }
        public DateTime createdAt { get; set; }
        public int? modifiedBy { get; set; }
        public DateTime? modifiedAt { get; set; }
        public int version { get; set; }
        public string uniqueKey { get; set; }

        public virtual ICollection<Vehicle> Vehicle { get; set; }
    }
}