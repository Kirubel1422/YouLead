import { Loadable } from "@/components/state";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface JoinProps {
     open: boolean;
     setOpen: (open: boolean) => void;
     onJoin: (teamId: string) => void;
     loading: boolean;
}

const Join = ({ open, setOpen, onJoin, loading }: JoinProps) => {
     const [teamId, setTeamId] = useState<string>("");

     return (
          <Dialog open={open} onOpenChange={setOpen}>
               <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                         <DialogTitle>
                              <span>+ Join Team</span>
                         </DialogTitle>
                    </DialogHeader>
                    <Label htmlFor="teamId" className="text-sm font-medium text-gray-900 dark:text-gray-300">
                         Team ID
                    </Label>
                    <Input
                         name="teamId"
                         id="teamId"
                         onChange={(e) => setTeamId(e.target.value)}
                         placeholder="Team ID..."
                    />

                    <DialogFooter>
                         <Button variant={"outline"}>Close</Button>
                         <Loadable isLoading={loading}>
                              <Button onClick={() => onJoin(teamId)}>Join</Button>
                         </Loadable>
                    </DialogFooter>
               </DialogContent>
          </Dialog>
     );
};

export default Join;
