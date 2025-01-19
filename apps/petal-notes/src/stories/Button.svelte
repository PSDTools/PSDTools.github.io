<script lang="ts">
  import "./button.css";

  interface Props {
    /** What background color should the button be? */
    backgroundColor?: string;
    /** What is the contents of the button? */
    label: string;
    /** What should happen on "click" events? */
    onClick?: (() => void) | undefined;
    /** Is this the principal call to action on the page? */
    primary?: boolean;
    /** How large should the button be? */
    size?: "large" | "medium" | "small";
  }

  const {
    backgroundColor,
    label,
    onClick,
    primary = false,
    size = "medium",
  }: Props = $props();
</script>

<button
  style:background-color={backgroundColor}
  class={["storybook-button", `storybook-button--${size}`].join(" ")}
  class:storybook-button--primary={primary}
  class:storybook-button--secondary={!primary}
  onclick={onClick}
  type="button"
>
  {label}
</button>
