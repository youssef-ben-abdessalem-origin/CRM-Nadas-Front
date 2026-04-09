import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CRMLayout } from "@/components/CRMLayout";
import { VendorForm } from "@/components/vendors/VendorForm";
import api from "@/lib/api";

const NewVendor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const isEdit = !!id;

  const { data: vendorData, isLoading: isVendorLoading } = useQuery({
    queryKey: ["vendor", id],
    queryFn: () => api.vendors.getOne(id).catch(() => null),
    enabled: isEdit,
  });

  const createMutation = useMutation({
    mutationFn: api.vendors.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor strategic profile established");
      navigate("/vendors");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.vendors.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      queryClient.invalidateQueries({ queryKey: ["vendor", id] });
      toast.success("Vendor profile synchronized");
      navigate("/vendors");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (data: any) => {
    if (isEdit && id) {
      updateMutation.mutate({ id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isEdit && isVendorLoading) {
    return (
      <CRMLayout title="Vendor Intelligence">
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
          <div className="h-10 w-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500/60">Recalling Partner Data...</p>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title={isEdit ? `Synchronize Partner: ${vendorData?.name}` : "Strategic Procurement"}>
      <div className="min-h-full flex flex-col justify-start py-8 px-6 animate-fade-in w-full">
        <div className="mb-10 text-center lg:text-left">
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">{isEdit ? "Edit Strategic Partner" : "New Vendor Acquisition"}</h2>
          <p className="text-slate-500 text-sm max-w-2xl">Capture and analyze strategic vendor data across global procurement networks.</p>
        </div>

        <VendorForm
          onCancel={() => navigate("/vendors")}
          onSubmit={handleSubmit}
          initialData={vendorData}
          isPending={isEdit ? updateMutation.isPending : createMutation.isPending}
        />
      </div>
    </CRMLayout>
  );
};

export default NewVendor;
