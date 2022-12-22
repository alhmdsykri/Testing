namespace Sera.Entity.SQL
{
    [ExcludeFromCodeCoverage]
    [Table("Material", Schema = "dbo")]
    public partial class Material
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int materialId { get; set; }
        public int? serviceTypeId { get; set; }
        public int? productId { get; set; }
        public string? UOMCode { get; set; }
        public string materialCode { get; set; }
        public string materialName { get; set; }
        public int vehicleTypeId { get; set; }
        public string vehicleTypeCode { get; set; }
        public string vehicleTypeName { get; set; }
        public int rentalDuration { get; set; }
        public string rentalDurationType { get; set; }
        public bool isSLITrucking { get; set; }
        public int? businessUnitId { get; set; }
        public string businessUnitCode { get; set; }
        public string businessUnitName { get; set; }
        public string transactionId { get; set; }
        public DateTime? dataStoreTime { get; set; }
        public DateTime? sapMssqlSinkTime { get; set; }
        public DateTime? persistedDate { get; set; }
        public int status { get; set; }
        public string uniqueKey { get; set; }
        public int version { get; set; }
        public int createdBy { get; set; }
        public DateTime createdAt { get; set; }
        public int? modifiedBy { get; set; }
        public DateTime? modifiedAt { get; set; }
    }
}
