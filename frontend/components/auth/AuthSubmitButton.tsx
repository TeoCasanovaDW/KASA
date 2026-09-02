// The mockups draw the same submit control on both auth pages: a fixed 230px
// pill-less rounded button, centred under the form column, kasa-red with the
// component sheet's darker shade as its hover state.
export default function AuthSubmitButton({
  label,
  pendingLabel,
  pending,
}: {
  label: string;
  pendingLabel: string;
  pending: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-5 w-[230px] self-center rounded-lg bg-kasa-red py-2 text-sm text-kasa-white transition-colors hover:bg-kasa-dark-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kasa-red disabled:opacity-70"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
