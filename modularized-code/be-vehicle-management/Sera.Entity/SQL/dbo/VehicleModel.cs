namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("VehicleModel", Schema = "dbo")]
    public partial class VehicleModel
    {
        public VehicleModel()
        {
            Vehicle = new HashSet<Vehicle>();
        }

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int vehicleModelId { get; set; }
        public string vehicleModelCode { get; set; }
        public string vehicleModelName { get; set; }
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