interface ChatWindowProps {
  selectedContact: string | null;
  isMobile: boolean;
}

export const ChatWindow = ({ selectedContact, isMobile }: ChatWindowProps) => {
  return (
    <>
      <h1>chat window</h1>
      <p>Selected contact: {selectedContact ?? "None"}</p>
      <p>Mobile view: {isMobile ? "Yes" : "No"}</p>
    </>
  );
};