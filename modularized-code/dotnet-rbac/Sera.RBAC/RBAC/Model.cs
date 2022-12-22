namespace Sera.RBAC
{
    public class RBACModel
    {
        public int permissionId { get; set; }
        public int parentFeatureId { get; set; }
        public string featureName { get; set; }
        public string attributeId { get; set; }
        public int active { get; set; }
    }
}
