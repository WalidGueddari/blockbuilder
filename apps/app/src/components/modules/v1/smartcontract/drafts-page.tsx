'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import type { DraftContract } from '@/types/smartContract';
import { formatDistanceToNow } from 'date-fns';
import { Clock, Code, Eye, FileEdit, Rocket, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useDrafts } from './hooks/useDrafts';

export default function DraftsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { savedDrafts, loading, error, loadDraftForEditing, deleteDraft } = useDrafts();
  const [draftToDelete, setDraftToDelete] = useState<string | null>(null);
  const [viewDraftDetails, setViewDraftDetails] = useState<DraftContract | null>(null);

  const handleEditDraft = (draft: DraftContract) => {
    loadDraftForEditing(draft.id);
    router.push('/smartcontract/create');
  };

  const handleDeleteDraft = (draftId: string) => {
    deleteDraft(draftId);
    setDraftToDelete(null);
    toast({
      title: 'Draft Deleted',
      description: 'The draft has been deleted successfully.',
    });
  };

  const handleDeployDraft = (draft: DraftContract) => {
    loadDraftForEditing(draft.id);
    router.push('/smartcontract/create');
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl space-y-8 py-8">
        <div className="flex items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl space-y-8 py-8">
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <div className="bg-destructive/10 rounded-full p-3">
            <Code className="text-destructive h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-medium">Error Loading Drafts</h3>
          <p className="text-muted-foreground mt-2 max-w-md">{error}</p>
          <Button className="mt-6" onClick={() => router.push('/smartcontract/create')}>
            Create New Contract
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Saved Drafts</h1>
        <p className="text-muted-foreground mt-2">Manage your saved smart contract drafts</p>
      </div>

      {savedDrafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <div className="bg-muted rounded-full p-3">
            <FileEdit className="text-muted-foreground h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-medium">No drafts found</h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            You haven't saved any contract drafts yet. Create a new contract and save it as a draft
            to see it here.
          </p>
          <Button className="mt-6" onClick={() => router.push('/smartcontract/create')}>
            Create New Contract
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {savedDrafts.map((draft) => (
            <Card key={draft.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="line-clamp-1">{draft.name}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {draft.updatedAt
                          ? `Updated ${formatDistanceToNow(new Date(draft.updatedAt), { addSuffix: true })}`
                          : 'Recently updated'}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge variant="outline">Custom</Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex flex-wrap gap-1">
                  {draft.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="text-muted-foreground mt-3 flex items-center gap-1 text-sm">
                  <Code className="h-3.5 w-3.5" />
                  <span className="line-clamp-1">{draft.content.split('\n')[0]}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-red-700"
                  onClick={() => setDraftToDelete(draft.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewDraftDetails(draft)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                  <Button variant="outline" size="sm" onClick={() => handleEditDraft(draft)}>
                    <FileEdit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {viewDraftDetails && (
        <Dialog
          open={!!viewDraftDetails}
          onOpenChange={(isOpen) => !isOpen && setViewDraftDetails(null)}
        >
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Draft: {viewDraftDetails.name}</DialogTitle>
              <DialogDescription>Details of your saved contract draft.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="mb-1 font-semibold">Description:</h4>
                  <p className="text-muted-foreground text-sm">
                    {viewDraftDetails.description || 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="mb-1 font-semibold">Type:</h4>
                  <p className="text-muted-foreground text-sm">
                    {viewDraftDetails.config?.contractType || viewDraftDetails.type || 'N/A'}
                  </p>
                </div>
                {viewDraftDetails.config?.symbol && (
                  <div>
                    <h4 className="mb-1 font-semibold">Symbol:</h4>
                    <p className="text-muted-foreground text-sm">
                      {viewDraftDetails.config.symbol}
                    </p>
                  </div>
                )}
                <div>
                  <h4 className="mb-1 font-semibold">Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewDraftDetails.config?.mintable && <Badge variant="outline">Mintable</Badge>}
                    {viewDraftDetails.config?.burnable && <Badge variant="outline">Burnable</Badge>}
                    {viewDraftDetails.config?.pausable && <Badge variant="outline">Pausable</Badge>}
                  </div>
                </div>
                <div>
                  <h4 className="mb-1 font-semibold">Tags:</h4>
                  <div className="flex flex-wrap gap-1">
                    {viewDraftDetails.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                    {(!viewDraftDetails.tags || viewDraftDetails.tags.length === 0) && (
                      <p className="text-muted-foreground text-sm">N/A</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Contract Code:</h4>
                  <pre className="bg-muted max-h-60 overflow-auto rounded-md p-3 text-sm">
                    <code>{viewDraftDetails.content}</code>
                  </pre>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="sm:justify-end">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={!!draftToDelete} onOpenChange={(open) => !open && setDraftToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the draft from your
              account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => draftToDelete && handleDeleteDraft(draftToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
