// comments.js
// This script provides dynamic comment functionality for Hugo sites.
// It handles displaying comment forms, submitting comments via AJAX,
// and managing comment state without full page reloads.

document.addEventListener('DOMContentLoaded', () => {
    const commentsSection = document.getElementById('comments');
    if (!commentsSection) return;

    const commentFormContainer = document.getElementById('comment-form-container');
    const newCommentFormTemplate = document.getElementById('new-comment-form-template');
    const replyFormTemplate = document.getElementById('reply-form-template');
    const topLevelReplyWrapperTemplate = document.getElementById('top-level-reply-wrapper-template');
    const nestedReplyWrapperTemplate = document.getElementById('nested-reply-wrapper-template');
    const commentSuccessMessageTemplate = document.getElementById('comment-success-message-template');

    let activeForm = null; // Stores the currently displayed comment form

    /**
     * Displays a comment form (either new comment or reply form).
     * @param {HTMLElement} targetElement The element to append the form to.
     * @param {string} parentId The ID of the parent comment, if it's a reply.
     * @param {string} replyTo The author name being replied to.
     * @param {boolean} isReply True if it's a reply form, false for a new top-level comment form.
     */
    const displayCommentForm = (targetElement, parentId = '', replyTo = '', isReply = false) => {
        // If a form is already active, remove it before showing a new one
        if (activeForm) {
            activeForm.remove();
            activeForm = null;
        }

        const template = isReply ? replyFormTemplate : newCommentFormTemplate;
        const formClone = template.content.cloneNode(true);
        const formElement = formClone.querySelector('form');

        if (parentId) {
            formElement.querySelector('input[name="parent"]').value = parentId;
        }
        if (replyTo) {
            formElement.querySelector('input[name="reply_to"]').value = replyTo;
        }
        if (isReply) {
            // Adjust label for replies
            const commentLabel = formElement.querySelector('[data-comment-label]');
            if (commentLabel) commentLabel.textContent = `Reply to ${replyTo}:`;
        }

        targetElement.appendChild(formClone);
        activeForm = formElement; // Set the newly displayed form as active

        // Add event listeners for form submission and cancellation
        formElement.addEventListener('submit', handleFormSubmission);
        formElement.querySelector('[data-cancel-btn]').addEventListener('click', () => {
            formElement.remove();
            activeForm = null;
            // Re-enable all reply buttons when a form is cancelled
            commentsSection.querySelectorAll('[data-reply-btn]').forEach(btn => btn.style.display = 'inline-flex');
        });
    };

    /**
     * Handles the submission of a comment form via AJAX.
     * @param {Event} event The form submission event.
     */
    const handleFormSubmission = async (event) => {
        event.preventDefault(); // Prevent default form submission

        const form = event.target;
        const formData = new FormData(form);
        const parentId = formData.get('parent');

        // Assuming an API endpoint exists to handle comment submissions
        // This is a placeholder and needs to be replaced with actual backend logic
        const apiEndpoint = '/api/comments'; // Example API endpoint

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                body: formData,
                // Add headers if your API requires them (e.g., Content-Type: application/json)
            });

            if (response.ok) {
                // Display success message
                const successMessageClone = commentSuccessMessageTemplate.content.cloneNode(true);
                form.replaceWith(successMessageClone); // Replace form with success message
                activeForm = null;
                // Re-enable all reply buttons
                commentsSection.querySelectorAll('[data-reply-btn]').forEach(btn => btn.style.display = 'inline-flex');
                // Optionally, refresh comments or add new comment dynamically
            } else {
                // Handle API errors (e.g., display an error message to the user)
                console.error('Comment submission failed:', response.statusText);
                alert('Failed to submit comment. Please try again.');
            }
        } catch (error) {
            console.error('Network error during comment submission:', error);
            alert('An error occurred. Please check your network connection and try again.');
        }
    };

    // Initial setup: Display form for new top-level comments
    if (commentFormContainer) {
        displayCommentForm(commentFormContainer);
    }

    // Enable reply buttons and attach event listeners
    commentsSection.querySelectorAll('[data-reply-btn]').forEach(button => {
        button.style.display = 'inline-flex'; // Make button visible
        button.addEventListener('click', (event) => {
            const li = event.target.closest('li[data-comment-id]');
            if (!li) return;

            const parentId = li.getAttribute('data-comment-id');
            const authorElement = li.querySelector('.text-neso-fg1:not([data-comment-label])'); // Get author of the comment being replied to
            const replyTo = authorElement ? authorElement.textContent.trim() : 'Anonymous';

            // Hide all other reply buttons when a reply form is active
            commentsSection.querySelectorAll('[data-reply-btn]').forEach(btn => {
                if (btn !== button) {
                    btn.style.display = 'none';
                }
            });
            button.style.display = 'none'; // Hide the clicked reply button

            // Determine where to append the reply form based on hierarchy
            let replyTarget = li;
            let isNested = false;
            const existingReplies = li.querySelector('ol');

            // If there are existing replies, append to them, otherwise create a new wrapper
            if (existingReplies) {
                const nestedWrapperClone = nestedReplyWrapperTemplate.content.cloneNode(true);
                replyTarget = nestedWrapperClone.querySelector('li');
                existingReplies.appendChild(nestedWrapperClone);
                isNested = true;
            } else {
                // Create a top-level reply wrapper if no replies exist yet
                const topLevelWrapperClone = topLevelReplyWrapperTemplate.content.cloneNode(true);
                li.appendChild(topLevelWrapperClone);
                replyTarget = topLevelWrapperClone.querySelector('div'); // The div inside the wrapper
                isNested = false; // It's a top-level reply wrapper, but form content might be nested
            }

            // Display the reply form
            displayCommentForm(replyTarget, parentId, replyTo, true);

            // Scroll to the new form
            replyTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    });

    // Function to initialize comments from local storage (if any)
    // This is for client-side persistence and a placeholder for server-side persistence
    const loadComments = () => {
        // Placeholder for loading comments. In a real application, this would fetch
        // comments from a backend API and render them.
        console.log('Loading existing comments...');
        // Example: dynamically add a comment for testing
        /*
        const exampleCommentHtml = `
            <li class="flex gap-4" data-comment-id="test-comment-1">
                <div class="flex-shrink-0">
                    <div class="h-10 w-10 rounded-full bg-neso-bg2 text-neso-fg1 flex items-center justify-center font-medium">JD</div>
                </div>
                <div class="flex-1">
                    <div class="flex items-baseline justify-between">
                        <div class="text-sm font-semibold text-neso-fg1">John Doe</div>
                        <time class="text-xs text-neso-fg3">Jan 1, 2026</time>
                    </div>
                    <div class="mt-2 text-neso-fg1">This is an example comment.</div>
                </div>
            </li>
        `;
        commentsSection.querySelector('ol').insertAdjacentHTML('beforeend', exampleCommentHtml);
        */
    };

    loadComments();
});