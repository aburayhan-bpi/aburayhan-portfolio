import CustomButton from "@/components/shared/CustomButton";

const CancelSubmitButton = ({
  handleCancel,
  btn1Text,
  btn2Text,
  isLoading = false,
  disabled = false,
}: {
  handleCancel: () => void;
  btn1Text?: string;
  btn2Text?: string;
  isLoading?: boolean;
  disabled?: boolean;
}) => {
  return (
    <div>
      <div className="flex gap-4 items-center justify-end">
        <CustomButton
          className="md:px-8 border border-border bg-secondary/50 hover:bg-secondary text-foreground hover:text-foreground hover:cursor-pointer transition-colors duration-200 rounded-xl"
          variant="outline"
          btnText="Cancel"
          type="button"
          onClick={handleCancel}
          disabled={isLoading || disabled}
        />

        <CustomButton
          type="submit"
          btnText={`${btn1Text ? btn1Text : btn2Text ? btn2Text : "Confirm"}`}
          className="px-8 bg-destructive text-white hover:bg-destructive/90 transition-colors duration-200 focus-visible:ring-0 hover:cursor-pointer rounded-xl"
          loading={isLoading}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default CancelSubmitButton;
